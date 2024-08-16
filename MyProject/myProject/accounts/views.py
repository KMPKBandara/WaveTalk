from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from .forms import RegisterForm, LoginForm

# Register view
def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})

# Login view
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                form.add_error(None, "Invalid username or password.")
    else:
        form = LoginForm()

    return render(request, 'accounts/login.html', {'form': form})

# Logout view
def user_logout(request):
    logout(request)
    return redirect('login')

# Home view
def home(request):
    return render(request, 'home.html')

# Profile view
def profile(request):
    return render(request, 'accounts/profile.html')

# Groups view
def groups(request):
    return render(request, 'accounts/groups.html')

# Upload video view
def upload_video(request):
    return render(request, 'accounts/upload_video.html')

# Create group view
def create_group(request):
    return render(request, 'accounts/create_group.html')

# Chat view
def chat(request):
    return render(request, 'accounts/chat.html')
