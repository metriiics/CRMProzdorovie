from django.shortcuts import render, redirect, get_object_or_404
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
    
class RecordDataAPIView(APIView):
    def get(self, request):
        record_id = request.query_params.get('record_id')
        
        if not record_id:
            return Response(
                {'error': 'record_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            record = get_object_or_404(Application, id=record_id)
            
            # Получаем данные врача через связанного пользователя
            doctor_user = record.doctor.user
            
            data = {
                'id': record.id,
                'client': {
                    'id': record.client.id,
                    'last_name': record.client.last_name,
                    'first_name': record.client.first_name,
                    'surname': record.client.surname or '',
                    'phone_number': record.client.phone_number or '',
                },
                'doctor': {
                    'id': record.doctor.id,
                    'user_id': doctor_user.id,
                    'last_name': doctor_user.last_name,
                    'first_name': doctor_user.first_name,
                    'surname': doctor_user.surname or '',
                    'specialization': {
                        'id': record.doctor.specialization.id,
                        'name': record.doctor.specialization.name
                    }
                },
                'status': {
                    'id': record.status.id,
                    'name': record.status.status
                },
                'date_recording': record.date_recording,
                'date_call': record.date_call,
                'date_next_call': record.date_next_call,
                'comments': [
                    {
                        'id': comment.id,
                        'created_at': comment.created_at.strftime('%d.%m.%Y %H:%M'),
                        'manager': {
                            'id': comment.manager.id,
                            'full_name': f"{comment.manager.last_name} {comment.manager.first_name} {comment.manager.surname or ''}".strip()
                        },
                        'text': comment.comment
                    }
                    for comment in record.comments.all()
                ]
            }
            return Response(data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(login_required(login_url='login'), name='dispatch')
class ApplicationsView(View):
    def get(self, request):
        # параметры сортировки из GET-запроса
        sort_field = request.GET.get('sort', 'id')
        sort_direction = request.GET.get('dir', 'asc')

        # параметры фильтрации
        doctor_filter = request.GET.getlist('doctor')  # список выбранных врачей
        search_query = request.GET.get('search', '')  # параметр поиска
        start_date = request.GET.get('start_date')  # Начальная дата
        end_date = request.GET.get('end_date')  # Конечная дата
        record_start_date = request.GET.get('record_start_date')  # Начальная дата записи
        record_end_date = request.GET.get('record_end_date')  # Конечная дата записи
        call_start_date = request.GET.get('call_start_date')  # Начальная дата звонка
        call_end_date = request.GET.get('call_end_date')  # Конечная дата звонка

        # порядок сортировки
        if sort_direction == 'desc':
            sort_field = f'-{sort_field}'

        # main запрос
        queryset = Application.objects.select_related(
            'client',
            'status',
            'doctor',
            'doctor__user',
        ).prefetch_related(
            Prefetch('comments', queryset=Comment.objects.select_related('manager'))
        )

        #  фильтры по датам
        if start_date and end_date:
            queryset = queryset.filter(client__created_at__range=[start_date, end_date])
        if record_start_date and record_end_date:
            queryset = queryset.filter(date_recording__range=[record_start_date, record_end_date])
        if call_start_date and call_end_date:
            queryset = queryset.filter(date_next_call__range=[call_start_date, call_end_date])

        #  фильтры по врачам
        if doctor_filter:
            queryset = queryset.filter(doctor__user__last_name__in=doctor_filter)

        #  фильтрацию по поисковому запросу
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

        #  список всех врачей 
        doctors = Doctor.objects.select_related('user').filter(user__role_id=3).values_list('user__last_name', flat=True).distinct()

        context = {
            'page_obj': page_obj,
            'current_sort': sort_field.lstrip('-'),
            'current_direction': sort_direction,
            'doctors': doctors,  
            'search_query': search_query, 
            'start_date': start_date,  
            'end_date': end_date, 
            'record_start_date': record_start_date,  
            'record_end_date': record_end_date, 
            'call_start_date': call_start_date, 
            'call_end_date': call_end_date, 
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
        client_id = request.POST.get('client_id')
        last_name = request.POST.get('last_name')
        first_name = request.POST.get('first_name')
        surname = request.POST.get('surname')
        phone_number = request.POST.get('phone_number')
        
        #  клиента из БД
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            messages.error(request, 'Клиент не найден')
            return redirect('change_client')

        if last_name:
            client.last_name = last_name
        if first_name:
            client.first_name = first_name
        if surname:
            client.surname = surname
        if phone_number:
            client.phone_number = phone_number
        
        client.save()
        return JsonResponse({'status': 'success', 'message': 'Данные сохранены!'})
        
    
class ModalViewChangeRecord(View):
    def get(self, request):
        return render(request, 'crm/change_record.html')
    
    def post(self, request):
        record_id = request.POST.get('record_id')
        record = get_object_or_404(Application, id=record_id)

        doctor_id = request.POST.get('doctor_id')
        client_status = request.POST.get('client_status')

        service_date = request.POST.get('service_date')

        callback_date = request.POST.get('callback_date')

        if doctor_id:
            record.doctor_id = doctor_id
        if client_status:
            record.status = client_status
        if service_date:
            record.date_recording = service_date
        if callback_date:
            record.date_next_call = callback_date

        record.save()

        comment_text = request.POST.get('comment')
        if comment_text:
            Comment.objects.create(
                application=record,
                manager=request.user,
                comment=comment_text
            )

        return JsonResponse({'status': 'success', 'message': 'Запись успешно обновлена'})

    
class ModalViewCreateRecord(View):
    def get(self, request):
        return render(request, 'crm/create_record.html')
    
    def post(self, request):
        # Для FormData используем request.POST
        data = {
            'client_id': request.POST.get('client_id'),
            'doctor_id': request.POST.get('doctor_id'),
            'service_date': request.POST.get('service_date'),
            'callback_date': request.POST.get('callback_date'),
            'comment': request.POST.get('comment'),
        }
        
        # Валидация обязательных полей
        required_fields = ['client_id', 'doctor_id', 'service_date']
        for field in required_fields:
            if not data[field]:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Поле {field} обязательно для заполнения'
                }, status=400)

        # Создаем запись
        record = Application.objects.create(
            client_id=data['client_id'],
            doctor_id=data['doctor_id'],
            date_recording=data['service_date'],
            date_next_call=data['callback_date'],
            status_id=1  # Статус "Новая"
        )
        
        # Добавляем комментарий, если есть
        if data['comment']:
            Comment.objects.create(
                application=record,
                manager=request.user,
                comment=data['comment']
            )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Запись успешно создана',
            'record_id': record.id
        })

