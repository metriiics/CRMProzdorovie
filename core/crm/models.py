from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class Role(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'role'
        verbose_name = 'Роль'
        verbose_name_plural = 'Роли'
        managed = False


class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    surname = models.CharField(max_length=100, null=True)
    email = models.EmailField(null=True)
    is_active = models.BooleanField(default=True)

    date_joined = models.DateTimeField(auto_now_add=True, null=True)
    is_staff = models.BooleanField(default=False, null=True)
    is_superuser = models.BooleanField(default=False, null=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name="user_set",
        related_query_name="user",
        db_table="users_user_groups"
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name="user_set",
        related_query_name="user",
        db_table="users_user_permissions"
    )

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.last_name} {self.first_name}"
        return str(self.username)  

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        managed = False


class Specialization(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'specializations_doctor'
        verbose_name = 'Специализация врача'
        verbose_name_plural = 'Специализации врачей'
        managed = False

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, db_column='specializations_id', related_name='doctors')

    def __str__(self):
            if self.user:
                return f"{self.user.last_name} {self.user.first_name} {self.user.surname} ({self.specialization})"

    class Meta:
        db_table = 'doctor'
        verbose_name = 'Врач'
        verbose_name_plural = 'Врачи'
        managed = False


class Client(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100, null=True)
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        parts = []
        if self.last_name:
            parts.append(self.last_name)
        if self.first_name:
            parts.append(self.first_name)
        if self.surname:
            parts.append(self.surname)
        return " ".join(parts) if parts else "Клиент без имени"

    class Meta:
        db_table = 'clients'
        verbose_name = 'Клиент'
        verbose_name_plural = 'Клиенты'

        constraints = [
            models.UniqueConstraint(
                fields=['first_name', 'last_name', 'phone_number'],
                name='unique_client'
            )
        ]
        managed = False


class Status(models.Model):
    status = models.CharField(max_length=100)

    def __str__(self):
        return self.status

    class Meta:
        db_table = 'status'
        verbose_name = 'Статус'
        verbose_name_plural = 'Статусы'
        managed = False

class Application(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, db_column='id_client', related_name='applications')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, db_column='id_doctor', related_name='applications')
    date_recording = models.CharField(max_length=100, null=True)
    date_call = models.CharField(max_length=100, null=True)
    date_next_call = models.CharField(max_length=100, null=True)
    status = models.ForeignKey(Status, on_delete=models.CASCADE, related_name='applications')

    def __str__(self):
        return f"Заявка #{self.id} - {self.client} ({self.date_recording})"

    class Meta:
        db_table = 'applications'
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        managed = False


class Comment(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, db_column='applications_id', related_name='comments')
    manager = models.ForeignKey(User, on_delete=models.CASCADE, db_column='manager_id', related_name='comments')
    comment = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        managed = False
