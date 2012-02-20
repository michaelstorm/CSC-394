from __future__ import with_statement
from django.contrib.auth.models import User, AnonymousUser
from threading import Lock
import logging

logger = logging.getLogger()

sessions = {}
next_session_key = 0
sessions_lock = Lock()

def authenticate(username=None, password=None):
  try:
    user = User.objects.get(username=username)
    if user.check_password(password):
      return user
  except User.DoesNotExist:
    return None

def login(request, user):
  global next_session_key
  global sessions
  global sessions_lock

  with sessions_lock:
    next_session_key += 1
    request.session_key = str(next_session_key)
    request.set_session_key = True

    request.user = user
    sessions[request.session_key] = user
    print 'logged in user ' + str(user.id) + ' to session id ' + str(request.session_key)
    print 'sessions: ' + str(sessions)

def logout(request):
  print 'logged out user ' + str(request.user.id) + ' from session id ' + str(request.session_key)
  request.session_key = ''
  request.set_session_key = True
  request.user = AnonymousUser()

class MemoryAuthentication(object):
  def process_request(self, request):
    global sessions
    try:
      print 'request.COOKIES:' + str(request.COOKIES)
      session_key = request.COOKIES['memory_sessionid']
      print 'session_key:' + str(session_key)
      request.user = sessions[session_key]
      print 'user:' + str(request.user)
      request.session_key = session_key
      print 'request.session_key:' + str(request.session_key)
    except:
      print 'except anonymous'
      print 'sessions: ' + str(sessions)
      request.user = AnonymousUser()

  def process_response(self, request, response):
    if hasattr(request, 'set_session_key'):
      response.set_cookie('memory_sessionid', value=request.session_key, max_age=60*60*24*14*2)
    return response
