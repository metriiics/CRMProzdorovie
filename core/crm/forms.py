from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
import re

class AddClientForm(forms.Form):
    first_name = forms.CharField(max_length=100, required=True, error_messages={'required': 'Имя клиента не указано!'})
    last_name = forms.CharField(max_length=100, required=True, error_messages={'required': 'Фамилия клиента не указана!'})
    surname = forms.CharField(max_length=100, required=False) 
    phone_number = forms.CharField(max_length=20, required=True, error_messages={'required': 'Номер клиента не указан!'})

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']

        if not re.match(r'^\+?[0-9\s\-\(\)]{7,20}$', phone_number):
            raise ValidationError("Введите корректный номер телефона")
        return phone_number
    
class ChangeClientForm(forms.Form):
    client_id = forms.IntegerField(required=True, error_messages={'required': 'Пожалуйста, выберите клиента'})
    last_name = forms.CharField(max_length=100, required=True, error_messages={'required': 'Фамилия клиента не указана!'})
    first_name = forms.CharField(max_length=100, required=True, error_messages={'required': 'Имя клиента не указано!'})
    surname = forms.CharField(max_length=100, required=False)
    phone_number = forms.CharField(max_length=20, required=True, error_messages={'required': 'Номер клиента не указан!'})

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']
        # Проверка формата номера телефона
        if not re.match(r'^\+?[0-9\s\-\(\)]{7,20}$', phone_number):
            raise ValidationError("Введите корректный номер телефона")
        return phone_number
    

class CreateRecordForm(forms.Form):
    client_id = forms.IntegerField(required=True, error_messages={'required': 'Не выбран клиент'})
    doctor_id = forms.IntegerField(required=True, error_messages={'required': 'Не выбран врач'})
    client_status = forms.IntegerField(required=True, error_messages={'required': 'Не указан статус'})
    service_date = forms.DateField(required=True, error_messages={'required': 'Не указана дата услуги'})
    callback_date = forms.DateField(required=True)
    comment = forms.CharField(required=False, max_length=500)

    def clean_service_date(self):
        service_date = self.cleaned_data['service_date']
        if service_date < timezone.now().date():
            raise ValidationError("Дата услуги не может быть в прошлом")
        return service_date

    def clean_callback_date(self):
        callback_date = self.cleaned_data.get('callback_date')
        service_date = self.cleaned_data.get('service_date')
        
        if callback_date and service_date:
            if callback_date < service_date:
                raise ValidationError("Дата следующего звонка не может быть раньше даты услуги")
        return callback_date

    def clean(self):
        cleaned_data = super().clean()
        # Дополнительные проверки
        return cleaned_data