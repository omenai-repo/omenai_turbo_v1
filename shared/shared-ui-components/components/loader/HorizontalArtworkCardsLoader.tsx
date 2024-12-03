import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function HorizontalArtworkCardLoader(){
    return(
        <div className='w-full flex items-center gap-5 overflow-x-hidden'>
            {new Array(7).fill('').map((_, index: number) => (
                <div className="min-w-[250px] lg:min-w-[300px] flex flex-col gap-2" key={index}>
                    <Skeleton className='h-[250px] w-full' />
                    <Skeleton count={2} className='' />
                </div>
            ))}
        </div>
    )
}