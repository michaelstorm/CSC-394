from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.template import Template, Context
from django.utils.encoding import smart_str, force_unicode
from django.utils.safestring import mark_safe
import logging
import markdown2
import os

logger = logging.getLogger()

workingDir = os.path.dirname(os.path.normpath(os.sys.modules[settings.SETTINGS_MODULE].__file__))

def home(request):
  return serveStatic(request, 'landing.html')

def serveStatic(request, name):
  f = open(workingDir + '/static/' + name, 'r')
  if name.endswith('.css'):
    response = HttpResponse(f.read(), content_type='text/css')
  elif name.endswith('.js'):
    response = HttpResponse(f.read(), content_type='text/javascript')
  elif name.endswith('.html'):
    response = HttpResponse(Template(f.read()).render(Context({'user': request.user})), content_type='text/html')
  elif name.endswith('.png'):
    response = HttpResponse(f.read(), content_type='image/png')
  elif name.endswith('.gif'):
    response = HttpResponse(f.read(), content_type='image/gif')
  else:
    response = HttpResponse(f.read())
  return response

def markdownify(value):
  return mark_safe(markdown2.markdown(force_unicode(value), safe_mode=True, tab_width=2))

def markdownify_request(request):
  text = request.POST['text']
  return HttpResponse(markdownify(text))

def error(request):
  msg  = request.POST['msg']
  url  = request.POST['url']
  line = request.POST['line']

  logger.error("JavaScript error in " + url + " at line " + line + "\n" + msg)
  return HttpResponse()

class DisableCRSF(object):
  def process_request(self, request):
    setattr(request, '_dont_enforce_csrf_checks', True)
