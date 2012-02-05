from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from mixboard.models import Song, Comment
from mixboard.forms import CommentForm
from django.template import Template, Context
from mixboard.main import workingDir



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

  song = Song(owner=request.user, name=name, data=data)
  song.save()

  return HttpResponse('success')

@login_required 
def postComment(request, song_id):
    if request.method == 'POST':
        form = CommentForm(request.post)
        if form.is_valid():
            #process form 
            comment_data = form.cleaned_data['comment']
            #create commend object, and save it to db
            db_comment_obj = Comment(comment=comment_data, song=song_id, owner=request.user.id)
            db_comment_obj.save() 
            
            context = Context({'song_id':song_id})
            f = open(workingDir + '/templates/commentThanks.html', 'r')
            result = Template(f.read()).render(context)
            return HttpResponse(result, content_type='text/html') 
            
    
    form = CommentForm()

    context = Context({'form':form, 'song_id':song_id})
    f = open(workingDir + '/templates/post_comment.html', 'r')
    result = Template(f.read()).render(context)
    return HttpResponse(result, content_type='text/html')

def commentThanks(request, song_id):
    context = Context({'song_id':song_id})
    f = open(workingDir + '/templates/commentThanks.html', 'r')
    result = Template(f.read()).render(context)
    return HttpResponse(result, content_type='text/html') 

def viewComments(request, song_id):
    #return list of comments as dictionary to whatever comment view there is
    comment_list = Comment.objects.filter(song=song_id)
    song = Song.objects.get(id=song_id)

    context = Context({'comment_list':comment_list, 'song_name':song.name})
    f = open(workingDir + '/templates/view_comments.html', 'r')
    result = Template(f.read()).render(context)
    return HttpResponse(result, content_type='text/html')
  
    
    

@login_required
def list(request):
  songs = Song.objects.filter(owner=request.user)
  return HttpResponse('\n'.join(s.name for s in songs))

@login_required
def get(request, name):
  song = Song.objects.get(owner=request.user, name=name)
  return HttpResponse(song.data)
