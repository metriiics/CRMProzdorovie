from .models import User, Client, Status, Role, Doctor, Application, Specialization, Comment
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'surname']

class ClientSerializer(serializers.ModelSerializer):
    fio = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['first_name', 'last_name', 'surname', 'phone_number', 'created_at', 'fio']
        
    def get_fio(self, obj):
        return f"{obj.last_name} {obj.first_name} {obj.surname}"

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['status']

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class DoctorSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Doctor
        fields = ['user']

class CommentSerializer(serializers.ModelSerializer):
    manager_id = UserSerializer(source='manager', read_only=True)

    class Meta:
        model = Comment
        fields = ['manager_id', 'comment']

class ApplicationSerializer(serializers.ModelSerializer):
    status_id = serializers.CharField(source='status.status', read_only=True)
    id_doctor = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Application
        fields = ['id_doctor', 'date_next_call', 'status_id']
    
class CombineSerializer(serializers.Serializer):
    last_name = serializers.CharField(source='client.last_name')
    first_name = serializers.CharField(source='client.first_name')
    surname = serializers.CharField(source='client.surname')
    phone_number = serializers.CharField(source='client.phone_number')
    status_id = serializers.CharField(source='status.status')
    id_doctor = serializers.SerializerMethodField()
    comment = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='client.created_at')
    date_next_call = serializers.CharField()
    manager_id = serializers.SerializerMethodField()
    
    def get_id_doctor(self, obj):
        doctor = obj.doctor #Врач из app
        user = doctor.user #пользователь связ. с врачем
        return f"{user.last_name} {user.first_name} {user.surname}" # фио врача

    def get_comment(self, obj):
        last_comment = obj.comments.order_by('-created_at').first() #все коменты с заявки
        return last_comment.comment if last_comment else None

    def get_manager_id(self, obj):
        last_comment = obj.comments.order_by('-created_at').first() #последний коммент
        if last_comment:
            manager = last_comment.manager # manager in comment
            return f"{manager.last_name} {manager.first_name} {manager.surname}" #фио манагера
        return None