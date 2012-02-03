from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.template import Template, Context
import os

workingDir = os.path.dirname(os.path.normpath(os.sys.modules[settings.SETTINGS_MODULE].__file__))

@login_required
def home(request):
  return serveStatic(request, 'index.html')

def serveStatic(request, name):
  f = open(workingDir + '/static/' + name, 'r')
  if name.endswith('.css'):
    response = HttpResponse(f.read(), content_type='text/css')
  elif name.endswith('.js'):
    response = HttpResponse(f.read(), content_type='text/javascript')
  elif name.endswith('.html'):
    response = HttpResponse(Template(f.read()).render(Context({'user': request.user})), content_type='text/html')
  else:
    response = HttpResponse(f.read())
  return response

class DisableCRSF(object):
  def process_request(self, request):
    setattr(request, '_dont_enforce_csrf_checks', True)
