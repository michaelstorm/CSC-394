from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from mixboard.models import Song

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
def list(request):
  songs = Song.objects.filter(owner=request.user)
  return HttpResponse('\n'.join(s.name for s in songs))

@login_required
def get(request, name):
  song = Song.objects.get(owner=request.user, name=name)
  return HttpResponse(song.data)
