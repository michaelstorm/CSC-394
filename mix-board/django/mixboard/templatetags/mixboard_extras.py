from django import template

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
