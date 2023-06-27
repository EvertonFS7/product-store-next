import { useRouter } from "next/router"

export default function Product() {
    const { query } = useRouter()
    
    return (
        <div>
            Produtos: {JSON.stringify(query)}
        </div>
    )
}