export default function Loading() {
  return (
    <div className="container-app py-6">
      <div className="space-y-4">
        <div className="card animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="card animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="card animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}
