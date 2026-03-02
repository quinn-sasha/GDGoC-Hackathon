from django.urls import path

from .views import GoogleAuthView, LoginView, RegisterView, VerifyEmailView

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("verify-email", VerifyEmailView.as_view(), name="verify-email"),
    path("login", LoginView.as_view(), name="login"),
    path("google", GoogleAuthView.as_view(), name="google-auth"),
]
