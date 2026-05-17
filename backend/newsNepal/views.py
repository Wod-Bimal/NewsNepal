from django.http import HttpResponseRedirect

def home(request):
    """
    View function for the home page of the site.
    Redirects to the frontend application.
    """
    return HttpResponseRedirect("http://localhost:3000")