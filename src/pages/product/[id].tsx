import { stripe } from "@/lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import Stripe from "stripe"
import Image from 'next/image'
import axios from "axios"
import { useState } from "react"

interface ProductProps {
    product: {
        id: string
        name: string
        imageUrl: string
        price: number
        description: string
        defaultPriceId: string
    }
}

export default function Product({ product }: ProductProps) {
    const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)
    const { isFallback } = useRouter()

    if (isFallback) {
        return <p>Loading...</p>
    }

    async function handleBuyProduct() {
        try {
            setIsCreatingCheckoutSession(true)
            const response = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId
            })

            const { checkoutUrl } = response.data

            window.location.href = checkoutUrl //rota externa 
        } catch (error) {
            setIsCreatingCheckoutSession(false)
            alert('Falha ao redirecionar ao checkout!')
        }
    }

    return (
        <ProductContainer>
            <ImageContainer>
                <Image src={product.imageUrl} width={520} height={480} alt="" />
            </ImageContainer>

            <ProductDetails>
                <h1>{product.name}</h1>

                <span>{product.price}</span>

                <p>{product.description}</p>
                <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>buy now</button>
            </ProductDetails>
        </ProductContainer>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: true
    }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
    const productId = params?.id

    const product = await stripe.products.retrieve(String(productId), {
        expand: ['default_price']
    })

    const price = product.default_price as Stripe.Price

    return {
        props: {
            product: {
                id: product.id,
                name: product.name,
                imageUrl: product.images[0],
                price: new Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(price.unit_amount! / 100),
                description: product.description,
                defaultPriceId: price.id
            }
        },
        revalidate: 60 * 60 * 1 // 1 hours
    }
}