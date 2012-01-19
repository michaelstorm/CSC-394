from django.http import HttpResponse
from subprocess import call
from midiutil.MidiFile import MIDIFile
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

def play(request):
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
    pitch = strToMidiPitch(note['pitch'])
    duration = note['duration']
    start = note['start']
    midiFile.addNote(track, channel, pitch, start, duration, volume)
    string += "added note " + note['pitch'] + ": " + str(pitch) + ", "

  binfile = open("/tmp/output.mid", 'wb')
  midiFile.writeFile(binfile)
  binfile.close()

  call(['fluidsynth', '-l', '-F', '/tmp/output.wav', '/usr/share/sounds/sf2/FluidR3_GM.sf2', '/tmp/output.mid'])
  call(['lame', '--preset', 'standard', '/tmp/output.wav', '/tmp/output.mp3'])

  return HttpResponse(string)
