import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function ArtworksListingSkeletonLoader(){
    return(
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {new Array(8).fill('').map((_, index: number) => (
                <div className="w-full flex flex-col gap-2" key={index}>
                    <Skeleton className='h-[300px] w-full' />
                    <Skeleton count={2} />
                </div>
            ))}
        </div>
    )
}