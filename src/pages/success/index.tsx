import { stripe } from '@/lib/stripe';
import { ImageContainer, SuccessContainer } from '@/styles/pages/success';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Stripe from 'stripe';

interface SuccessProps {
    customerName: string
    product: {
        name: string
        imageUrl: string
    }
}

export default function Success({ customerName, product }: SuccessProps) {
    return (
        <>
            <Head>
                <title>Compra concluída | Ignite Shop</title>

                <meta name='robots' content='noindex' />
            </Head>
            <SuccessContainer>
                <h1>Compra efetuada</h1>
                <ImageContainer>
                    <Image src={product.imageUrl} width={220} height={110} alt='' />
                </ImageContainer>

                <p>Uhuul <strong>Everton Fernandes</strong>, sua <strong>{product.name} </strong>
                    já está a caminho da sua casa. </p>
                <Link href='/'>voltar ao catálogo</Link>
            </SuccessContainer>
        </>

    )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const sessionId = String(query.session_id)

    if (!query.session_id) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product']
    })

    const customerName = session?.customer_details?.name
    const product = session?.line_items?.data[0].price?.product as Stripe.Product

    return {
        props: {
            customerName,
            product: {
                name: product.name,
                imageUrl: product.images[0]
            }
        }
    }
}