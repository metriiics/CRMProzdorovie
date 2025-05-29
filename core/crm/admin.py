from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserCreationForm
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

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

class DoctorAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization')
    list_filter = ('specialization',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')

class ClientAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'surname', 'phone_number', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('last_name', 'first_name', 'phone_number')

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_client_name', 'get_doctor_name', 'status', 'date_recording')
    list_filter = ('status', 'doctor')
    search_fields = ('client__last_name', 'client__first_name')

    def get_client_name(self, obj):
        return str(obj.client)
    get_client_name.short_description = 'Клиент'
    
    def get_doctor_name(self, obj):
        return str(obj.doctor) if obj.doctor else 'Не назначен'
    get_doctor_name.short_description = 'Доктор'

class CommentAdmin(admin.ModelAdmin):
    list_display = ('application', 'manager', 'created_at')
    list_filter = ('manager',)
    search_fields = ('comment',)

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'surname',
        'is_active',
        'is_staff',
        'is_superuser',
        'role'
    )
    readonly_fields = ('last_login', 'date_joined')  # Добавлено для отображения, но без редактирования
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Персональная информация', {
            'fields': ('first_name', 'last_name', 'surname', 'email', 'role')
        }),
        ('Права доступа', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),  # Исправлен кортеж и добавлено date_joined
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'role',
                'username',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'surname',
                'email',
                'is_active',
                'is_staff',
                'is_superuser'
            ),
        }),
    )


custom_admin_site.register(Role)
custom_admin_site.register(User, UserAdmin)
custom_admin_site.register(Specialization)
custom_admin_site.register(Doctor, DoctorAdmin)
custom_admin_site.register(Client, ClientAdmin)
custom_admin_site.register(Status)
custom_admin_site.register(Application, ApplicationAdmin)
custom_admin_site.register(Comment, CommentAdmin)