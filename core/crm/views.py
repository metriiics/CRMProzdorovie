from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import status
from .models import Client, Application, Comment, Doctor, Status, User
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch
from .serializers import CombineSerializer, ClientSerializer, StatusSerializer
from rest_framework.pagination import PageNumberPagination
from django.views import View

class LoginView(APIView):
    def get(self, request):
        return render(request, 'crm/home.html')
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    

def client_list(request):
    clients = Client.objects.all()
    
    search_query = request.GET.get('search')
    if search_query:
        clients = clients.filter(
            Q(last_name__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(surname__icontains=search_query) |
            Q(phone_number__icontains=search_query)
        )
    

    paginator = Paginator(clients, 30)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query, 
    }
    return render(request, 'crm/clients_list.html', context)
        
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
    
def respHome(request):
    return render(request, "crm/login.html")

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
    
class ModalViewChangeClient(View):
    def get(self, request):
        return render(request, 'crm/change_client.html')
    
class ModalViewChangeRecord(View):
    def get(self, request):
        return render(request, 'crm/change_record.html')
    
class ModalViewCreateRecord(View):
    def get(self, request):
        return render(request, 'crm/create_record.html')

