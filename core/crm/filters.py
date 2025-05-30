import django_filters
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Specialization
from django import forms

User = get_user_model()

class EmployeeFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(
        method='filter_search',
        label='',
        widget=forms.TextInput(attrs={'placeholder': 'Поиск...'})
    )

    role = django_filters.MultipleChoiceFilter(
        field_name='role__name',
        lookup_expr='iexact',
        choices=[],
        widget=forms.CheckboxSelectMultiple
    )
    
    specialization = django_filters.MultipleChoiceFilter(
        field_name='doctor_profile__specialization__name',
        lookup_expr='iexact',
        choices=[],
        widget=forms.CheckboxSelectMultiple
    )
    
    
    class Meta:
        model = User
        fields = []

    def filter_search(self, queryset, name, value):
        # Пример фильтрации по фамилии, имени и username
        return queryset.filter(
            Q(last_name__icontains=value) |
            Q(first_name__icontains=value) |
            Q(username__icontains=value)
        )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Заполняем варианты ролей
        from .models import Role, Specialization  # Импортируйте свои модели
        self.filters['role'].extra['choices'] = [
            (role.name, role.name) for role in Role.objects.all()
        ]
        self.filters['specialization'].extra['choices'] = [
            (spec.name, spec.name) for spec in Specialization.objects.all()
        ]