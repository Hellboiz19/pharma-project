from rest_framework import serializers
from .models import Product, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderItemInputSerializer(serializers.Serializer):
    productID = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20)
    items = OrderItemInputSerializer(many=True, allow_empty=False)


class OrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="product.name",
        read_only=True
    )
    class Meta:
        model = OrderItem
        fields = ["name", "unit_price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_email",
            "customer_phone",
            "status",
            "total",
            "transaction_id",
            "created_at",
            "items",
        ]