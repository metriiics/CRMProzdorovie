from crm.admin import custom_admin_site
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', custom_admin_site.urls),
    path('', include('crm.urls'))
]