from django.contrib import admin
from django.urls import path
from django.shortcuts import render  # Import render here
from accounts import views as accounts_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', accounts_views.register, name='register'),
    path('login/', accounts_views.user_login, name='login'),
    path('', lambda request: render(request, 'home.html'), name='home'),  # This line now works
    path('profile/', accounts_views.profile, name='profile'),  # Profile URL
    path('groups/', accounts_views.groups, name='groups'),  # Groups URL
    path('upload_video/', accounts_views.upload_video, name='upload_video'),  # Upload Video URL
    path('create_group/', accounts_views.create_group, name='create_group'),  # Create Group URL
    path('chat/', accounts_views.chat, name='chat'),  # Chat URL
    path('logout/', accounts_views.user_logout, name='logout'),  # Logout URL
]

