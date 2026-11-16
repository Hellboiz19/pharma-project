from django.contrib import admin
from django.utils.html import format_html, format_html_join

from .models import Product, Order, OrderItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["productID", "name", "price", "quantity"]
    search_fields = ["name"]
    list_filter = ["quantity"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    fields = [
        "quantity",
        "unit_price",
        "subtotal",
    ]

    readonly_fields = [
        "quantity",
        "unit_price",
        "subtotal",
    ]

    can_delete = False

    @admin.display(description="Totale")
    def subtotal(self, obj):
        return f"{obj.unit_price * obj.quantity:.2f} €"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "customer_name",
        "customer_email",
        "status",
        "total",
        "created_at",
    ]

    list_filter = ["status", "created_at"]
    search_fields = ["customer_name", "customer_email"]
    readonly_fields = ["total", "created_at", "paid_at"]

    inlines = [OrderItemInline]

