from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework import status
from .models import Client, Application, Comment, Doctor, Status, User
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch, Case, When, IntegerField
from .serializers import CombineSerializer, ClientSerializer, StatusSerializer
from django.views import View
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from .forms import AddClientForm, CreateRecordForm, ChangeClientForm
from loguru import logger


class LoginView(APIView):
    def get(self, request):
        return render(request, 'crm/login.html')
    
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)

        if user is not None and user.is_active:
            login(request, user)
            logger.info(f'Пользователь {username} вошел в систему')
            if user.role_id == 1:
                return redirect('employee-list')  # имя URL для админа
            elif user.role_id == 2:
                return redirect('applications-list')
        else:
            logger.info(f'Неудачная попытка входа: username={username}')
            messages.error(request, 'Неверный логин или пароль')
            return render(request, 'crm/login.html')

class StatusSearchView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        
        statuses = Status.objects.filter(
            status__icontains=query
        ).order_by('status')[:10]
        
        results = [{
            'id': status.id,
            'name': status.status,
        } for status in statuses]
        
        return Response({'statuses': results}, status=status.HTTP_200_OK)

#поиска врача
class SearchDoctorAPIView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        if query:
            doctors = Doctor.objects.filter(
                user__role_id=3,
                user__first_name__icontains=query
            ) | Doctor.objects.filter(
                user__role_id=3,
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

        if len(query) < 2:
            return Response({'clients': []})
        
        clients = Client.objects.annotate(
            relevance=Case(
                When(last_name__istartswith=query, then=1),
                When(first_name__istartswith=query, then=2),
                When(surname__istartswith=query, then=3),
                output_field=IntegerField()
            )
        ).filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(surname__icontains=query),
            is_active=True
        ).order_by('relevance', 'last_name')[:10]

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
            logger.error(f'Error status code = 500 {e}')
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

        status_filter = request.GET.getlist('status')

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

        if status_filter:
            queryset = queryset.filter(status__status__in=status_filter)

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

        #  все статусы из базы данных
        statuses = Status.objects.all().values_list('status', flat=True)

        context = {
            'page_obj': page_obj,
            'current_sort': sort_field.lstrip('-'),
            'current_direction': sort_direction,
            'doctors': doctors,  
            'statuses': statuses,
            'selected_statuses': status_filter,
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
        form = AddClientForm(request.POST)

        if not form.is_valid():
            errors = form.errors.as_json()

            first_error = None
            if form.errors:
                first_error_list = list(form.errors.values())[0]
                first_error = first_error_list[0] if first_error_list else None


            return JsonResponse({'status': 'error', 'message': first_error or 'Некорректные данные. Проверьте и повторите!', 'errors': errors}, status=400)

        if Client.objects.filter(
            first_name=form.cleaned_data['first_name'].capitalize(),
            last_name=form.cleaned_data['last_name'].capitalize(),
            phone_number=form.cleaned_data['phone_number'],
        ).exists():
            return JsonResponse({
                'status': 'error', 
                'message': 'Клиент с таким именем, фамилией и номером телефона уже существует!'
            }, status=400)
        else:
            client = Client(
                first_name=form.cleaned_data['first_name'].capitalize(),
                last_name=form.cleaned_data['last_name'].capitalize(),
                surname=form.cleaned_data['surname'].capitalize(),
                phone_number=form.cleaned_data['phone_number'],
                created_at=timezone.now()
            )
            client.save()

            return JsonResponse({'status': 'success', 'message': 'Клиент успешно сохранен'})

class ModalViewChangeClient(View):
    def get(self, request):
        return render(request, 'crm/change_client.html')
    
    def post(self, request):
        form = ChangeClientForm(request.POST)

        if not form.is_valid():
            errors = form.errors.as_json()

            first_error = None
            if form.errors:
                first_error_list = list(form.errors.values())[0]
                first_error = first_error_list[0] if first_error_list else None

            return JsonResponse({
                'status': 'error',
                'message': first_error or 'Некорректные данные. Проверьте и повторите!',
                'errors': errors
            }, status=400)
        
        try:
            client = Client.objects.get(id=form.cleaned_data['client_id'])

            if request.POST.get('action') == 'deactivate':
                client.is_active = False
                client.save()
                return JsonResponse({
                    'status': 'success', 
                    'message': 'Клиент успешно деактивирован!'
                })

            client.last_name = form.cleaned_data['last_name']
            client.first_name = form.cleaned_data['first_name']
            client.surname = form.cleaned_data.get('surname', '')
            client.phone_number = form.cleaned_data['phone_number']
            
            client.save()

            return JsonResponse({
                'status': 'success', 
                'message': 'Данные клиента успешно обновлены!'
            })
        except Client.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Клиент не найден'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Ошибка при обновлении данных: {str(e)}'
            }, status=500)
    
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
            record.status = Status.objects.get(pk=client_status)
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
        form = CreateRecordForm(request.POST)

        if not form.is_valid():
            errors = form.errors.as_json()
            print(errors)

            first_error = None
            if form.errors:
                first_error_list = list(form.errors.values())[0]
                first_error = first_error_list[0] if first_error_list else None

            return JsonResponse({
                'status': 'error',
                'message': first_error or 'Некорректные данные. Проверьте и повторите!',
                'errors': errors
            })

        try:
            record = Application.objects.create(
                client_id=form.cleaned_data['client_id'],
                doctor_id=form.cleaned_data['doctor_id'],
                date_recording=form.cleaned_data['service_date'],
                date_next_call=form.cleaned_data.get('callback_date'),
                status_id=form.cleaned_data['client_status']
            )

            # Добавляем комментарий, если есть
            if form.cleaned_data['comment']:
                Comment.objects.create(
                    application=record,
                    manager=request.user,
                    comment=form.cleaned_data['comment']
                )

            return JsonResponse({
                'status': 'success',
                'message': 'Запись успешно создана',
                'record_id': record.id
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Ошибка при создании записи: {str(e)}'
            }, status=500)

@method_decorator(login_required(login_url='login'), name='dispatch')
class EmployeeView(View):
    def get(self, request):
        # Получаем всех пользователей с связанными данными
        users = User.objects.select_related('role').prefetch_related(
            'doctor_profile__specialization'
        ).all()

        employees = []
        for user in users:
            # Определяем специализацию только для врачей
            specialization = "-"
            if hasattr(user, 'doctor_profile') and user.role and user.role.name.lower() == 'врач':
                specialization = user.doctor_profile.specialization.name if user.doctor_profile.specialization else "-"
            
            employee_data = {
                'id': user.id,
                'fio': self._get_fio(user),
                'username': user.username,
                'email': user.email,
                'role': user.role.name if user.role else "-",
                'specialization': specialization,
            }
            employees.append(employee_data)
        
        paginator = Paginator(employees, 30)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'employees': page_obj,
            'page_obj': page_obj
        }
        return render(request, "crm/workers.html", context)
    
    def _get_fio(self, user):
        parts = []
        if user.last_name:
            parts.append(user.last_name)
        if user.first_name:
            parts.append(f"{user.first_name[0]}.")
        if user.surname:
            parts.append(f"{user.surname[0]}.")
        return ' '.join(parts) if parts else "-"
    
class Analytics(View):
    def get(self, request):
        return render(request, 'crm/call_analytics.html')
