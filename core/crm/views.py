from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework import status
from .models import Client, Application, Comment, Doctor, Status, User
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch
from .serializers import CombineSerializer, ClientSerializer, StatusSerializer
from rest_framework.pagination import PageNumberPagination
from django.views import View
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
import json


class LoginView(APIView):
    def get(self, request):
        return render(request, 'crm/login.html')
    
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)

        if user is not None and user.is_active:
            login(request, user)
            return redirect('applications-list') 
        else:
            print(f"Сообщение для пользователя {username}: Неверный логин или пароль")
            messages.error(request, 'Неверный логин или пароль')
            return render(request, 'crm/login.html')

#поиска врача
class SearchDoctorAPIView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        if query:
            doctors = Doctor.objects.filter(
                user__first_name__icontains=query
            ) | Doctor.objects.filter(
                user__last_name__icontains=query
            )
            doctors_list = [
                {'id': doctor.id, 'fio': f"{doctor.user.last_name} {doctor.user.first_name} {doctor.user.surname}"}
                for doctor in doctors
            ]
            return Response({'doctors': doctors_list})
        return Response({'doctors': []})
    
#поиска клиента
class SearchClientAPIView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')

        if not query:
            return Response({'clients': []})

        clients = Client.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(surname__icontains=query)
        )

        serializer = ClientSerializer(clients, many=True)
        return Response({'clients': serializer.data}, status=status.HTTP_200_OK)

@method_decorator(login_required(login_url='login'), name='dispatch')
class ApplicationsView(View):
    def get(self, request):
        # Получаем параметры сортировки из GET-запроса
        sort_field = request.GET.get('sort', 'id')
        sort_direction = request.GET.get('dir', 'asc')

        # Получаем параметры фильтрации
        doctor_filter = request.GET.getlist('doctor')  # Получаем список выбранных врачей
        search_query = request.GET.get('search', '')  # Получаем параметр поиска
        start_date = request.GET.get('start_date')  # Начальная дата
        end_date = request.GET.get('end_date')  # Конечная дата
        record_start_date = request.GET.get('record_start_date')  # Начальная дата записи
        record_end_date = request.GET.get('record_end_date')  # Конечная дата записи
        call_start_date = request.GET.get('call_start_date')  # Начальная дата звонка
        call_end_date = request.GET.get('call_end_date')  # Конечная дата звонка

        # Определяем порядок сортировки
        if sort_direction == 'desc':
            sort_field = f'-{sort_field}'

        # Начальный запрос
        queryset = Application.objects.select_related(
            'client',
            'status',
            'doctor',
            'doctor__user',
        ).prefetch_related(
            Prefetch('comments', queryset=Comment.objects.select_related('manager'))
        )

        # Применяем фильтры по датам
        if start_date and end_date:
            queryset = queryset.filter(client__created_at__range=[start_date, end_date])
        if record_start_date and record_end_date:
            queryset = queryset.filter(date_recording__range=[record_start_date, record_end_date])
        if call_start_date and call_end_date:
            queryset = queryset.filter(date_next_call__range=[call_start_date, call_end_date])

        # Применяем фильтры по врачам
        if doctor_filter:
            queryset = queryset.filter(doctor__user__last_name__in=doctor_filter)

        # Применяем фильтрацию по поисковому запросу
        if search_query:
            queryset = queryset.filter(
                Q(client__last_name__icontains=search_query) |
                Q(client__first_name__icontains=search_query) |
                Q(client__surname__icontains=search_query)
            )

        # Сортировка
        queryset = queryset.order_by(sort_field)

        # Пагинация
        paginator = Paginator(queryset, 30)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        # Получаем список всех врачей для фильтра через Doctor
        doctors = Doctor.objects.select_related('user').filter(user__role_id=3).values_list('user__last_name', flat=True).distinct()

        context = {
            'page_obj': page_obj,
            'current_sort': sort_field.lstrip('-'),
            'current_direction': sort_direction,
            'doctors': doctors,  # Передаем список врачей в шаблон
            'search_query': search_query,  # Передаем поисковый запрос в шаблон
            'start_date': start_date,  # Передаем начальную дату в шаблон
            'end_date': end_date,  # Передаем конечную дату в шаблон
            'record_start_date': record_start_date,  # Передаем начальную дату записи в шаблон
            'record_end_date': record_end_date,  # Передаем конечную дату записи в шаблон
            'call_start_date': call_start_date,  # Передаем начальную дату звонка в шаблон
            'call_end_date': call_end_date,  # Передаем конечную дату звонка в шаблон
        }

        return render(request, 'crm/index.html', context)

    
class ModalViewAddClient(View):
    def get(self, request):
        return render(request, 'crm/add_client.html')
    
    def post(self, request):

        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        surname = request.POST.get('surname')
        phone_number = request.POST.get('phone_number')
        
        client = Client(
            first_name=first_name,
            last_name=last_name,
            surname=surname,
            phone_number=phone_number,
            created_at=timezone.now()
        )
        client.save()
        
        return JsonResponse({'status': 'success', 'message': 'Клиент успешно сохранен'})

class ModalViewChangeClient(View):
    def get(self, request):
        return render(request, 'crm/change_client.html')
    def post(self, request):
        # Получаем данные из формы
        client_id = request.POST.get('client_id')
        last_name = request.POST.get('last_name')
        first_name = request.POST.get('first_name')
        surname = request.POST.get('surname')
        phone_number = request.POST.get('phone_number')

        # Проверяем обязательные поля
        if not client_id:
            messages.error(request, 'Требуется ID клиента')
            return redirect('change_client')  # Редирект на эту же страницу
        
        # Получаем клиента из БД
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            messages.error(request, 'Клиент не найден')
            return redirect('change_client')

        # Обновляем данные клиента
        if last_name:
            client.last_name = last_name
        if first_name:
            client.first_name = first_name
        if surname:
            client.surname = surname
        if phone_number:
            client.phone_number = phone_number
        
        # Сохраняем изменения
        client.save()

        return JsonResponse({
                'status': 'success',
                'message': 'Данные клиента успешно обновлены'
            })

        
    
class ModalViewChangeRecord(View):
    def get(self, request):
        return render(request, 'crm/change_record.html')
    
class ModalViewCreateRecord(View):
    def get(self, request):
        return render(request, 'crm/create_record.html')

