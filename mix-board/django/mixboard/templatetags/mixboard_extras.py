from datetime import date, datetime
from django import template
from django.template import defaultfilters
from django.utils.translation import pgettext, ungettext, ugettext as _

register = template.Library()

@register.filter
def truncatechars(s, num):
    """
    Truncates a word after a given number of chars
    Argument: Number of chars to truncate after
    """
    length = int(num)
    string = []
    for word in s.split():
        if len(word) > length:
            string.append(word[:length]+'...')
        else:
            string.append(word)
    return u' '.join(string)

@register.filter
def hyphenate(s):
  from re import sub
  return sub(r'[^a-zA-Z0-9]', '-', s)

@register.filter
def naturaltime(value):
    """
    For date and time values shows how many seconds, minutes or hours ago
    compared to current timestamp returns representing string.
    """
    if not isinstance(value, date): # datetime is a subclass of date
        return value

    now = datetime.now()
    if value < now:
        delta = now - value
        if delta.days != 0:
            return pgettext(
                'naturaltime', '%(delta)s ago'
            ) % {'delta': defaultfilters.timesince(value)}
        elif delta.seconds == 0:
            return _(u'now')
        elif delta.seconds < 60:
            return ungettext(
                u'a second ago', u'%(count)s seconds ago', delta.seconds
            ) % {'count': delta.seconds}
        elif delta.seconds // 60 < 60:
            count = delta.seconds // 60
            return ungettext(
                u'a minute ago', u'%(count)s minutes ago', count
            ) % {'count': count}
        else:
            count = delta.seconds // 60 // 60
            return ungettext(
                u'an hour ago', u'%(count)s hours ago', count
            ) % {'count': count}
    else:
        delta = value - now
        if delta.days != 0:
            return pgettext(
                'naturaltime', '%(delta)s from now'
            ) % {'delta': defaultfilters.timeuntil(value)}
        elif delta.seconds == 0:
            return _(u'now')
        elif delta.seconds < 60:
            return ungettext(
                u'a second from now', u'%(count)s seconds from now', delta.seconds
            ) % {'count': delta.seconds}
        elif delta.seconds // 60 < 60:
            count = delta.seconds // 60
            return ungettext(
                u'a minute from now', u'%(count)s minutes from now', count
            ) % {'count': count}
        else:
            count = delta.seconds // 60 // 60
            return ungettext(
                u'an hour from now', u'%(count)s hours from now', count
            ) % {'count': count}

import logging
logger = logging.getLogger()

@register.tag
def blockablegroup(parser, token):
  tag_name, group = token.split_contents()
  nodelist = parser.parse(('endblockablegroup',))
  parser.delete_first_token()
  return BlockableGroupNode(group[1:-1], nodelist)

class BlockableGroupNode(template.Node):
  def __init__(self, group, nodelist):
    self.group    = group
    self.nodelist = nodelist

  def render(self, context):
    context.push()
    context['blockablegroup'] = self.group

    output = self.nodelist.render(context)

    output += '<script type="text/javascript">'
    output += 'window.block%s = function() {' % self.group
    output +=   '$(\'img[blockablegroup_icon="%s"]\').show();' % self.group
    output +=   '$(\'div[blockablegroup="%s"]\').each(function(i, blockable) {' % self.group
    output +=     '$(blockable).block({ message: null, fadeIn: 400 });'
    output +=   '});'
    output += '};'
    output += 'window.unblock%s = function() {' % self.group
    output +=   '$(\'img[blockablegroup_icon="%s"]\').hide();' % self.group
    output +=   '$(\'div[blockablegroup="%s"]\').each(function(i, blockable) {' % self.group
    output +=     '$(blockable).unblock();'
    output +=   '});'
    output += '};'
    output += '</script>'

    context.pop()
    return output

@register.tag
def blockable(parser, token):
  contents = token.split_contents()
  style = ''
  if len(contents) > 1:
    style = contents[1]

  nodelist = parser.parse(('endblockable',))
  parser.delete_first_token()
  return BlockableNode(nodelist, style[1:-1])

class BlockableNode(template.Node):
  def __init__(self, nodelist, style):
    self.nodelist = nodelist
    self.style    = style

  def render(self, context):
    group = context['blockablegroup']

    output =  '<div blockablegroup="%s" style="%s">' % (group, self.style)
    output += self.nodelist.render(context)
    output += '</div>'

    return output

@register.simple_tag(takes_context=True)
def busyicon(context, path, style=''):
  group = context['blockablegroup']
  return '<img src="%s" blockablegroup_icon="%s" style="display: none; %s">' % (path, group, style)
