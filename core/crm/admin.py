from django.contrib import admin
from django.contrib.admin import AdminSite
from .models import (
    Role, 
    User,
    Specialization,
    Doctor,
    Client,
    Status,
    Application,
    Comment
)

class CustomAdminSite(AdminSite):
    site_header = 'Администрирование Prozdorovie'
    site_title = 'Prozdorovie Admin'
    index_title = 'Добро пожаловать в админ-панель'

custom_admin_site = CustomAdminSite(name='custom_admin')

# Кастомная настройка для модели User
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

# Кастомная настройка для модели Doctor
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization')
    list_filter = ('specialization',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')

# Кастомная настройка для модели Client
class ClientAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'surname', 'phone_number', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('last_name', 'first_name', 'phone_number')

# Кастомная настройка для модели Application
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'doctor', 'status', 'date_recording')
    list_filter = ('status', 'doctor')
    search_fields = ('client__last_name', 'client__first_name')

# Кастомная настройка для модели Comment
class CommentAdmin(admin.ModelAdmin):
    list_display = ('application', 'manager', 'created_at')
    list_filter = ('manager',)
    search_fields = ('comment',)

# Регистрация моделей (ИСПРАВЛЕННАЯ ЧАСТЬ)
custom_admin_site.register(Role)
custom_admin_site.register(User, UserAdmin)
custom_admin_site.register(Specialization)
custom_admin_site.register(Doctor, DoctorAdmin)
custom_admin_site.register(Client, ClientAdmin)
custom_admin_site.register(Status)
custom_admin_site.register(Application, ApplicationAdmin)
custom_admin_site.register(Comment, CommentAdmin)