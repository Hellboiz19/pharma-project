from rest_framework import serializers
from .models import Product, Order, OrderItem, Category

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ["id", "name", "description"]

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
    delivery_method = serializers.ChoiceField(
        choices=Order.DELIVERY_CHOICES,
        default="pickup"
    )

    delivery_address = serializers.CharField(
        required=False,
        allow_blank=True
    )
    payment_method = serializers.ChoiceField(
        choices=[
            ("card", "Carta"),
            ("cash", "Contanti"),
        ],
        default="card"
    )

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
            "delivery_method",
            "delivery_address",
            "shipping_cost",
            "payment_method",
            "status",
            "total",
            "transaction_id",
            "created_at",
            "items",
        ]

        