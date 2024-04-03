from django.shortcuts import render


# Create your views here.
def index(request):
    return render(request, 'index.html')

def analisis(request):
    return render(request, 'analisis.html')

def progra(request):
    return render(request, 'progra.html')