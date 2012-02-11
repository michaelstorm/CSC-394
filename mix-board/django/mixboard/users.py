from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import models
from django.http import HttpResponse
from django.template import Template, Context
from mixboard.main import serveStatic, workingDir
from mixboard.models import UserProfile, Song
import logging
import re

logger = logging.getLogger()

def login(request):
  username = request.POST['username']
  password = request.POST['password']

  if '@' in username:
    try:
      username = User.objects.get(email=username).username
    except:
      return HttpResponse('Incorrect username, email or password.')

  user = authenticate(username=username, password=password)
  if user is not None:
    if user.is_active:
      auth_login(request, user)
      return HttpResponse('success')
    else:
      return HttpResponse('Account disabled.')
  else:
    return HttpResponse('Incorrect username, email or password.')

@login_required
def logout(request):
  userid = 0
  if request.user.is_authenticated():
    userid = int(request.user.id)
  auth_logout(request)
  return HttpResponse()

def signup(request):
  return serveStatic(request, 'signup.html')

#6LfUgM0SAAAAALIS7ZLPqVDVJhagm_1KNadC1Jyj
#6LfUgM0SAAAAAIECYZ5ze6sKudylgHHbYHhjJjnm

def register(request):
  def valid_username_chars(name):
    return re.match(r'^[a-zA-Z0-9_\-. ]+$', name) != None

  def valid_username_spaces(name):
    return not name.startswith(' ') and not name.endswith(' ')

  username = request.POST['username']
  email    = request.POST['email']
  password = request.POST['password']

  if len(username) == 0:
    return HttpResponse('Please enter a name.')
  elif len(username) < 3:
    return HttpResponse('Name must contain at least 3 characters.')
  elif len(username) > 30:
    return HttpResponse('Name must contain 30 characters or fewer.')
  elif not valid_username_chars(username):
    return HttpResponse('Name must contain only ASCII letters, numbers, underscores, hypens, periods and spaces. Sorry about the temporary lack of Unicode support.')
  elif not valid_username_spaces(username):
    return HttpResponse('Name cannot start or end with a space.')
  elif len(User.objects.filter(username=username)) != 0:
    return HttpResponse('Name already in use.')

  if len(email) == 0:
    return HttpResponse('Please enter an email address.')
  elif not '.' in email or not '@' in email:
    return HttpResponse('Please enter a valid email address.')
  elif len(User.objects.filter(email=email)) != 0:
    return HttpResponse('Email already in use.')

  if len(password) == 0:
    return HttpResponse('Please enter a password.')
  elif len(password) < 6:
    return HttpResponse('Password must contain at least 6 characters.')

  user = User.objects.create_user(username, email, password)
  user.save()

  authUser = authenticate(username=username, password=password)
  auth_login(request, authUser)

  return HttpResponse('success')

def list(request):
  f = open(workingDir + '/templates/list_users.html', 'r')
  users = User.objects.all()
  result = Template(f.read()).render(Context({'user': request.user, 'users': users}))
  return HttpResponse(result, content_type='text/html')

def profile(request, userId):
  requestedUser = User.objects.get(id=userId)
  profile       = UserProfile.objects.get(user=requestedUser)
  songs         = Song.objects.filter(owner=requestedUser).order_by('-vote_count')
  context = Context({'user': request.user,
                     'requestedUser': requestedUser,
                     'profile': profile,
                     'songs': songs})

  f = open(workingDir + '/templates/profile.html', 'r')
  result = Template(f.read()).render(context)
  return HttpResponse(result, content_type='text/html')

@login_required
def update_profile(request):
  profile = UserProfile.objects.get(user=request.user)
  if 'bio' in request.POST:
    profile.bio = request.POST['bio']
  profile.save()

  return HttpResponse('success', content_type='text/html')
