from django.http import HttpResponse
from subprocess import call
import midi
import simplejson

def play(request):
  json = simplejson.loads(request.POST.get('notes'))

  return HttpResponse("success")
