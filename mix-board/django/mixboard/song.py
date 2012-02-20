from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.template import Template, Context
from mixboard.main import workingDir, serveStatic
from mixboard.models import Song, SongComment, UserProfile
import logging

logger = logging.getLogger()

@login_required
def create(request):
  return serveStatic(request, 'index.html')

@login_required
def save(request):
  name = request.POST['name']
  data = request.POST['data']

  if len(name) == 0:
    return HttpResponse('Please enter a name for this song.')
  elif len(name) > 60:
    return HttpResponse('Please enter a song name of 60 characters or fewer.')
  elif len(Song.objects.filter(owner=request.user, name=name)) != 0:
    return HttpResponse('This song name is already in use.')

  song = Song(owner=request.user, name=name, data=data, vote_count=1)
  song.save()

  logger.info('User ' + str(request.user.id) + ' saved song ' + str(song.id))
  return HttpResponse(str(song.id))

@login_required
def fork(request):
  originalSongId = request.POST['song']
  originalSong = Song.objects.get(id=originalSongId)

  newSongName = originalSong.name
  if 'name' in request.POST:
    newSongName = request.POST['name']

  if len(Song.objects.filter(owner=request.user, name=newSongName)) > 0:
    return HttpResponse('dup_name')

  newSong = Song(owner=request.user, name=newSongName, data=originalSong.data, vote_count=1)
  newSong.save()

  logger.info('User %s forked song %s into song %s' % (str(request.user.id), originalSongId, str(newSong.id)))
  return HttpResponse(str(newSong.id))

@login_required
def update(request):
  songId = request.POST['id']
  song = Song.objects.get(id=songId)
  if request.user != song.owner:
    return 'You are not this song\'s owner.'

  data = request.POST['data']

  song.data = data
  song.save()

  logger.info('User ' + str(request.user.id) + ' updated song ' + str(song.id))
  return HttpResponse('success')

def get(request, songId):
  song = Song.objects.get(id=songId)
  return HttpResponse(song.data)

@login_required
def list(request):
  songs = Song.objects.filter(owner=request.user)
  response = '{ "songs": ['
  response += ',\n'.join('{"name": "'+s.name+'", "id": '+str(s.id)+'}' for s in songs)
  response += '\n]\n}'
  return HttpResponse(response)

@login_required
def edit(request, songId):
  song = Song.objects.get(owner=request.user, id=songId)
  context = Context({'user': request.user,
                     'song': song})

  f = open(workingDir + '/static/index.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

def show(request, songId):
  song = Song.objects.get(id=songId)
  comments = SongComment.objects.filter(song=song)

  upvoted = False
  if request.user.is_authenticated() and len(UserProfile.objects.filter(user=request.user, upvoted_songs=song)):
    upvoted = True

  downvoted = False
  if request.user.is_authenticated() and len(UserProfile.objects.filter(user=request.user, downvoted_songs=song)):
    downvoted = True

  context = Context({'user':         request.user,
                     'comments':     comments,
                     'song':         song,
                     'upvoted':      upvoted,
                     'downvoted':    downvoted,
                     'current_path': request.get_full_path()})

  f = open(workingDir + '/templates/show_song.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

@login_required
def add_comment(request):
  songId = request.POST['song']
  text = request.POST['text']

  song = Song.objects.get(id=songId)

  comment = SongComment(song=song, author=request.user, text=text)
  comment.save()

  logger.info('User %s made comment %s on song %s' % (str(request.user.id), str(comment.id), str(song.id)))
  return HttpResponse('success')

@login_required
def edit_comment(request):
  commentId = request.POST['comment']
  text = request.POST['text']

  comment = SongComment.objects.get(id=commentId)
  if comment.author != request.user:
    return HttpResponse('Not authorized.')
  comment.text = text
  comment.save()

  logger.info('User %s edited comment %s on song %s' % (str(request.user.id), str(comment.id), str(comment.song.id)))
  return HttpResponse('success')

@login_required
def delete_comment(request):
  commentId = request.POST['comment']

  comment = SongComment.objects.get(id=commentId)
  if comment.author != request.user:
    return HttpResponse('Not authorized.')
  songId = comment.song.id
  comment.delete()

  logger.info('User %s deleted comment %s on song %s' % (str(request.user.id), str(comment.id), str(songId)))
  return HttpResponse('success')

def list_comments(request, songId):
  song = Song.objects.get(id=songId)
  comments = SongComment.objects.filter(song=song)
  context = Context({'user': request.user, 'comments': comments})

  f = open(workingDir + '/templates/comments_table.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

@login_required
def vote_up(request):
  songId = request.POST['song']
  song = Song.objects.get(id=songId)
  if len(UserProfile.objects.filter(user=request.user, upvoted_songs=song)):
    return HttpResponse('You can\'t upvote the same song twice.')

  if request.user == song.owner:
    return HttpResponse('You can\'t vote on your own song.')

  song.vote_count += 1
  song.save()

  profile = UserProfile.objects.get(user=request.user)
  if len(UserProfile.objects.filter(user=request.user, downvoted_songs=song)):
    profile.downvoted_songs.remove(song)
  else:
    profile.upvoted_songs.add(song)

  logger.info('User %s upvoted song %s to %s votes' % (str(request.user.id), str(song.id), str(song.vote_count)))
  return HttpResponse('success')

@login_required
def vote_down(request):
  songId = request.POST['song']
  song = Song.objects.get(id=songId)
  if len(UserProfile.objects.filter(user=request.user, downvoted_songs=song)):
    return HttpResponse('You can\'t downvote the same song twice.')

  if request.user == song.owner:
    return HttpResponse('You can\'t vote on your own song.')

  song.vote_count -= 1
  song.save()

  profile = UserProfile.objects.get(user=request.user)
  if len(UserProfile.objects.filter(user=request.user, upvoted_songs=song)):
    profile.upvoted_songs.remove(song)
  else:
    UserProfile.objects.get(user=request.user).downvoted_songs.add(song)

  logger.info('User %s downvoted song %s to %s votes' % (str(request.user.id), str(song.id), str(song.vote_count)))
  return HttpResponse('success')

def trending_table(request, max_songs):
  songs = Song.objects.order_by('-vote_count')[:int(max_songs)]
  context = Context({'user': request.user, 'songs': songs})

  f = open(workingDir + '/templates/trending.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

def trending(request):
  context = Context({'user': request.user})

  f = open(workingDir + '/static/trending.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')
