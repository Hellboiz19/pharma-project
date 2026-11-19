from django.urls import path
from .views import CategoryList, ProductList, OrderCreate, OrderPay

urlpatterns = [
    path("api/products/", ProductList.as_view()),
    path("api/orders/", OrderCreate.as_view()),
    path("api/orders/<int:pk>/pay/", OrderPay.as_view()),
    path("api/categories/", CategoryList.as_view(), name="category-list"),
]