from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.template import Template, Context
import logging
from mixboard.main import workingDir, serveStatic
from mixboard.models import Song, SongComment

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

  logger.info('user ' + str(request.user.id) + ' saved song ' + str(song.id))
  return HttpResponse('success')

@login_required
def fork(request):
  return HttpResponse('')

@login_required
def update(request):
  songId = request.POST['id']
  song = Song.objects.get(id=songId)
  if request.user != song.owner:
    return 'You are not this song\'s owner.'

  data = request.POST['data']

  song.data = data
  song.save()

  logger.info('user ' + str(request.user.id) + ' updated song ' + str(song.id))
  return HttpResponse('success')

def get(request, songId):
  song = Song.objects.get(id=songId)
  logger.debug('user ' + str(request.user.id) + ' retrieved song ' + str(song.id))
  logger.info('user ' + str(request.user.id) + ' retrieved song ' + str(song.id))
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
  context = Context({'user': request.user,
                     'comments': comments,
                     'song': song,
                     'current_path': request.get_full_path()})

  f = open(workingDir + '/templates/show_song.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

@login_required
def add_comment(request, username, songName):
  text = request.POST['text']

  requestedUser = User.objects.get(username=username)
  song = Song.objects.get(owner=requestedUser, name=songName)

  comment = SongComment(song=song, author=request.user, text=text)
  comment.save()

  return HttpResponse('success')

@login_required
def edit_comment(request, commentId):
  text = request.POST['text']

  comment = SongComment.objects.get(id=commentId)
  if comment.author != request.user:
    return HttpResponse('Not authorized.')
  comment.text = text
  comment.save()

  return HttpResponse('success')

@login_required
def delete_comment(request, commentId):
  if request.method != 'POST':
    return HttpResponse('HTTP POST required.')

  comment = SongComment.objects.get(id=commentId)
  if comment.author != request.user:
    return HttpResponse('Not authorized.')
  comment.delete()

  return HttpResponse('success')

def list_comments(request, username, songName):
  requestedUser = User.objects.get(username=username)
  song = Song.objects.get(owner=requestedUser, name=songName)
  comments = SongComment.objects.filter(song=song)
  context = Context({'user': request.user, 'comments': comments})

  f = open(workingDir + '/templates/comments_table.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

@login_required
def vote_up(request, username, songName):
  if request.method != 'POST':
    return HttpResponse('HTTP POST required.')

  if request.user.username == username:
    return HttpResponse('You can\'t vote on your own song.')

  requestedUser = User.objects.get(username=username)
  song = Song.objects.get(owner=requestedUser, name=songName)
  song.vote_count += 1
  song.save()

  return HttpResponse('success')

@login_required
def vote_down(request, username, songName):
  if request.method != 'POST':
    return HttpResponse('HTTP POST required.')

  if request.user.username == username:
    return HttpResponse('You can\'t vote on your own song.')

  requestedUser = User.objects.get(username=username)
  song = Song.objects.get(owner=requestedUser, name=songName)
  song.vote_count -= 1
  song.save()

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
