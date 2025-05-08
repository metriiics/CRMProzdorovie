from django import forms
from django.core.exceptions import ValidationError
import re

class AddClientForm(forms.Form):
    first_name = forms.CharField(max_length=100, required=True)
    last_name = forms.CharField(max_length=100, required=True)
    surname = forms.CharField(max_length=100, required=False)  # Отчество может быть необязательным
    phone_number = forms.CharField(max_length=20, required=True)

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']
        # Пример простой валидации номера (можно настроить под ваши требования)
        if not re.match(r'^\+?[0-9\s\-\(\)]{7,20}$', phone_number):
            raise ValidationError("Введите корректный номер телефона")
        return phone_number