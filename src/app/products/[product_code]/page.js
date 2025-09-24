"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Plus, Minus, Loader2, MessageSquare, Send } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const ProductDetailScreen = () => {
  const router = useRouter();
  const params = useParams();
  const product_code = params?.product_code;
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qnaList, setQnaList] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [userType, setUserType] = useState('guest');
  useEffect(() => {
    if (product_code) {
      fetchProductData();
      fetchReviews();
      fetchQnA();
    }
  }, [product_code]);
  useEffect(() => {
    const storedUserType = Cookies.get('user_type') || 'guest';
    setUserType(storedUserType);
  }, []);
  useEffect(() => {
    if (product?._id) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProductData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/by-code/${product_code}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        // Initialize selected variants
        const initialVariants = {};
        data.data.variants?.forEach(variant => {
          initialVariants[variant.variant_name] = variant.variant_value;
        });
        setSelectedVariants(initialVariants);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${product_code}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQnA = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/qna/product/${product_code}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setQnaList(data);
      } else if (data.success && data.data) {
        setQnaList(data.data);
      } else {
        setQnaList([]);
      }
    } catch (error) {
      console.error('Error fetching Q&A:', error);
      setQnaList([]);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}/related`);
      const data = await response.json();
      if (data.success && data.data) {
        setRelatedProducts(data.data.slice(0, 4)); // Limit to 4 products
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    }
  };

  const handleVariantChange = (variantName, value) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  const submitQuestion = async () => {
        if (userType === 'guest') {
      toast.error('Guests cannot submit questions. Please log in.');
      return;
    }
    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setSubmittingQuestion(true);

    try {
      const response = await fetch('http://localhost:5000/api/qna/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_code: product_code,
          question: newQuestion.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Your question has been submitted successfully!');
        setNewQuestion('');
        // Add the new question to the list immediately
        setQnaList(prev => [data, ...prev]);
        // Also refresh the full Q&A list
        fetchQnA();
      } else {
        toast.error('Failed to submit question');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const addToCart = async () => {
    const cart_code = Cookies.get('cart_code');
    
    if (!cart_code) {
      toast.error('Cart not found. Please refresh the page and try again.');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock.');
      return;
    }

    if (!product._id) {
      toast.error('Product ID not found.');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch(`http://localhost:5000/api/carts/${cart_code}/add-product`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product._id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`${product.product_name} added to cart!`, {
          description: `Quantity: ${quantity}`,
          action: {
            label: 'View Cart',
            onClick: () => router.push('/cart')
          }
        });
        
        // Reset quantity to 1 after successful addition
        setQuantity(1);
      } else {
        toast.error(data.message || 'Failed to add product to cart.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    const cart_code = Cookies.get('cart_code');
    
    if (!cart_code) {
      toast.error('Cart not found. Please refresh the page and try again.');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock.');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch(`http://localhost:5000/api/carts/${cart_code}/add-product`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product._id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product added to cart! Redirecting to checkout...');
        // Redirect to cart/checkout page
        setTimeout(() => {
          router.push('/cart');
        }, 1000);
      } else {
        toast.error(data.message || 'Failed to add product to cart.');
      }
    } catch (error) {
      console.error('Error during buy now:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">找不到產品</h2>
          <p className="text-gray-600">您正在尋找的產品不存在。</p>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.review, 0) / reviews.length 
    : 0;

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50">
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.productImages[selectedImageIndex]}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
              {product.is_featured && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                  精選
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              
              {/* Image Navigation */}
              {product.productImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex > 0 ? selectedImageIndex - 1 : product.productImages.length - 1
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex < product.productImages.length - 1 ? selectedImageIndex + 1 : 0
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-6 gap-2">
              {product.productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.product_name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.product_name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <Badge variant="outline">庫存單位 (SKU): {product.product_sku}</Badge>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                {product.short_description}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} 有現貨` : '缺貨'}
                </span>
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">選項</h3>
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    if (!acc[variant.variant_name]) {
                      acc[variant.variant_name] = [];
                    }
                    acc[variant.variant_name].push(variant.variant_value);
                    return acc;
                  }, {})
                ).map(([variantName, values]) => (
                  <div key={variantName} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {variantName}
                    </label>
                    <Select
                      value={selectedVariants[variantName] || values[0]}
                      onValueChange={(value) => handleVariantChange(variantName, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">產品特色</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((feature) => (
                    <div key={feature._id} className="bg-white rounded-lg p-3 border">
                      <div className="text-sm font-medium text-gray-700">
                        {feature.feature_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {feature.feature_value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">數量</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || addingToCart}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || addingToCart}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={addToCart}
                  disabled={product.stock === 0 || addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      添加中…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      加入購物車
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={buyNow}
                  disabled={product.stock === 0 || addingToCart}
                >
                  {addingToCart ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
             
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <div className="text-xs text-gray-600">兩年保固</div>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                <div className="text-xs text-gray-600">30 天退貨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details and Reviews Tabs */}
        <Card className="mt-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">產品詳情</TabsTrigger>
              <TabsTrigger value="reviews">
                評論 ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="qna">
                問答 ({qnaList.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">產品描述</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.long_description}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">產品規格</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature) => (
                        <div key={feature._id} className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-700">{feature.feature_name}</span>
                          <span className="text-gray-600">{feature.feature_value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {/* Reviews Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="text-3xl font-bold text-gray-900">
                          {averageRating.toFixed(1)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            {renderStars(Math.round(averageRating))}
                          </div>
                          <div className="text-sm text-gray-600">
                            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review._id} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={review.profile_picture} />
                                <AvatarFallback>
                                  {review.full_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {review.full_name}
                                  </h4>
                                  <div className="flex items-center space-x-1">
                                    {renderStars(review.review)}
                                  </div>
                                </div>
                                <p className="text-gray-700 mb-3">
                                  {review.review_text}
                                </p>
                                <div className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                {review.review_attachment && review.review_attachment.length > 0 && (
                                  <div className="mt-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {review.review_attachment.map((attachment, index) => (
                                        <img
                                          key={index}
                                          src={attachment}
                                          alt="Review attachment"
                                          className="w-full h-20 object-cover rounded-lg border"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Star className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無評論</h3>
                    <p className="text-gray-600">成為第一個評論此產品的人！</p>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="qna" className="mt-6">
              <CardContent>
                <div className="space-y-6">
                 {/* Ask Question Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">提出問題</h3>
                    <div className="space-y-4">
                      {userType === 'guest' && (
                        <div className="text-red-500 text-sm mb-2">
                         Please login to ask questions
                        </div>
                      )}
                      <Textarea
                        placeholder="What would you like to know about this product?"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="min-h-[100px]"
                        disabled={submittingQuestion || userType === 'guest'}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={submitQuestion}
                          disabled={submittingQuestion || !newQuestion.trim() || userType === 'guest'}
                        >
                          {submittingQuestion ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              提交中…
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              提交問題
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Q&A List */}
                  {qnaList.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">問題與答案</h3>
                      {qnaList.map((qna) => (
                        <Card key={qna._id} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Question */}
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold text-blue-600">Q</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-900 font-medium">{qna.question}</p>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(qna.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Answer */}
                              {qna.answer && qna.answer.trim() !== '' && (
                                <div className="flex items-start space-x-3 ml-4 pl-4 border-l-2 border-gray-100">
                                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-green-600">A</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-700">{qna.answer}</p>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(qna.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(!qna.answer || qna.answer.trim() === '') && (
                                <div className="ml-11 text-sm text-gray-500 italic">
                                  等待回覆中…
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <MessageSquare className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無任何問題</h3>
                      <p className="text-gray-600">成為第一個對此產品提問的人！</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">您可能也會喜歡</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct._id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={relatedProduct.productImages[0] || '/placeholder-product.jpg'}
                        alt={relatedProduct.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onClick={() => router.push(`/products/${relatedProduct.product_code}`)}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relatedProduct.product_name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(relatedProduct.price)}
                      </div>
                      {relatedProduct.is_featured && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {relatedProduct.stock > 0 ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />        
    </>
  );
};

export default ProductDetailScreen;