from django.http import HttpResponse
from django.conf import settings
import os

workingDir = os.path.dirname(os.path.normpath(os.sys.modules[settings.SETTINGS_MODULE].__file__))

def home(request):
  f = open(workingDir + '/static/index.html', 'r')
  response = HttpResponse(f.read())
  return response

def serveStatic(request, name):
  f = open(workingDir + '/static/' + name, 'r')
  response = HttpResponse(f.read())
  return response

class DisableCRSF(object):
  def process_request(self, request):
    setattr(request, '_dont_enforce_csrf_checks', True)
