from django.http import HttpResponse
from django.utils.encoding import smart_str
from midiutil.MidiFile import MIDIFile
from subprocess import call
from time import time
import simplejson

def strToMidiPitch(note):
  name = note[0]
  base = 0
  if name == 'a':
    base = 33
  elif name == 'b':
    base = 35
  elif name == 'c':
    base = 24
  elif name == 'd':
    base = 26
  elif name == 'e':
    base = 28
  elif name == 'f':
    base = 29
  elif name == 'g':
    base = 31

  pitch = base + ((int(note[1])-1)*12)
  if len(note) == 3:
    if (note[2] == 'b'):
      pitch -= 1
    else:
      pitch += 1

  return pitch

outputId = long(round(time()*1000))

def play(request):
  global outputId

  json = simplejson.loads(request.POST.get('notes'))

  midiFile = MIDIFile(1)

  track = 0
  time = 0
  midiFile.addTrackName(track, time, "Sample Track")
  midiFile.addTempo(track, time, 120)

  channel = 0
  volume = 100

  string = ""

  for note in json['notes']:
    print note
    pitch = strToMidiPitch(note['pitch'])
    duration = note['duration']
    start = note['start']
    midiFile.addNote(track, channel, pitch, start, duration, volume)
    string += "added note " + note['pitch'] + ": " + str(pitch) + ", "

  binfile = open("/tmp/output.mid", 'wb')
  midiFile.writeFile(binfile)
  binfile.close()

  call(['fluidsynth', '-l', '-F', '/tmp/output_'+str(outputId)+'.wav', '/usr/share/sounds/sf2/FluidR3_GM.sf2', '/tmp/output.mid'])
  call(['lame', '--preset', 'standard',
        '/tmp/output_'+str(outputId)+'.wav',
        '/tmp/output_'+str(outputId)+'.mp3'])
  outputId += 1

  return HttpResponse(outputId-1)

def output(request, number):
  filename = 'output_'+number+'.mp3'
  path = '/tmp/'+filename
  response = HttpResponse(content_type='audio/mpeg')
  response['Content-Disposition'] = 'attachment; filename=' + filename
  response['Accept-Ranges'] = 'bytes'
  response['X-Sendfile'] = path
  return response
