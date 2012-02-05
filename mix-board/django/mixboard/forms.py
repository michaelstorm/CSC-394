from django import forms

class CommentForm(forms.Form):
    comment = forms.CharField(max_length=1000, required=True)
