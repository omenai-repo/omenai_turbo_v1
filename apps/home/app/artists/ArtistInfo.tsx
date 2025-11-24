"use client";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { useState } from "react";

export default function ArtistInfo({
  loading,
  info,
  url,
}: {
  loading: boolean;
  info: any;
  url: string;
}) {
  const image_href = getOptimizedImage(url, "thumbnail");
  const [imageLoaded, setImageLoaded] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const isTruncated = info.bio.length > 300;
  const displayText =
    expanded || !isTruncated ? info.bio : info.bio.slice(0, 300) + "...";

  const toggleExpanded = () => setExpanded((prev) => !prev);
  const socials = info.documentation.socials;
  return (
    <div className="=bg-white=">
      <div className="max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Artist Image Section */}
          <div className="w-full md:w-auto">
            <div className="relative group">
              {/* Image container */}
              <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] mx-auto md:mx-0">
                {/* Loading state */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-100 rounded animate-pulse" />
                )}

                {/* Artist image */}
                <Image
                  fill
                  src={image_href}
                  alt={`${info.name} portrait`}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover rounded transition-all duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Artist Info Section */}
          <div className="flex-1 max-w-2xl">
            <div className="space-y-6">
              {/* Artist name */}
              <div>
                <h1 className="text-fluid-md md:text-fluid-xl font-bold text-[#0f172a] mb-2">
                  {info.name}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="h-[2px] w-16 bg-[#0f172a]"></div>
                  <span className="text-sm uppercase tracking-widest text-gray-500">
                    Artist
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                <p className="text-[#0f172a] leading-relaxed text-fluid-xxs">
                  {displayText}
                  {isTruncated && (
                    <button
                      onClick={toggleExpanded}
                      className="inline-flex items-center ml-2 group"
                    >
                      <span className="text-[#0f172a] font-medium underline underline-offset-4 hover:no-underline transition-all duration-200">
                        {expanded ? "Show less" : "Read more"}
                      </span>
                    </button>
                  )}
                </p>
              </div>

              {/* Additional info or actions */}
              {/* <div className="pt-6 flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-[#0f172a] text-white font-medium rounded hover:bg-[#2a2a2a] transition-colors duration-200">
                  View Portfolio
                </button>
                <button className="px-6 py-3 border-2 border-[#0f172a] text-[#0f172a] font-medium rounded hover:bg-[#0f172a] hover:text-white transition-all duration-200">
                  Contact Artist
                </button>
              </div> */}

              {/* Social links or additional info */}
              <div className="pt-6 flex items-center gap-4">
                {socials.twitter && socials.twitter !== "" && (
                  <a
                    href={socials.twitter}
                    className="text-[#0f172a] hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                )}
                {socials.instagram && socials.instagram !== "" && (
                  <a
                    href={socials.instagram}
                    className="text-[#0f172a] hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                )}
                {socials.linkedin && socials.linkedin !== "" && (
                  <a
                    href={socials.linkedin}
                    className="text-[#0f172a] hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 45.959 45.959"
                    >
                      <g>
                        <g>
                          <path
                            d="M5.392,0.492C2.268,0.492,0,2.647,0,5.614c0,2.966,2.223,5.119,5.284,5.119c1.588,0,2.956-0.515,3.957-1.489
			c0.96-0.935,1.489-2.224,1.488-3.653C10.659,2.589,8.464,0.492,5.392,0.492z M7.847,7.811C7.227,8.414,6.34,8.733,5.284,8.733
			C3.351,8.733,2,7.451,2,5.614c0-1.867,1.363-3.122,3.392-3.122c1.983,0,3.293,1.235,3.338,3.123
			C8.729,6.477,8.416,7.256,7.847,7.811z"
                          />
                          <path d="M0.959,45.467h8.988V12.422H0.959V45.467z M2.959,14.422h4.988v29.044H2.959V14.422z" />
                          <path
                            d="M33.648,12.422c-4.168,0-6.72,1.439-8.198,2.792l-0.281-2.792H15v33.044h9.959V28.099c0-0.748,0.303-2.301,0.493-2.711
			c1.203-2.591,2.826-2.591,5.284-2.591c2.831,0,5.223,2.655,5.223,5.797v16.874h10v-18.67
			C45.959,16.92,39.577,12.422,33.648,12.422z M43.959,43.467h-6V28.593c0-4.227-3.308-7.797-7.223-7.797
			c-2.512,0-5.358,0-7.099,3.75c-0.359,0.775-0.679,2.632-0.679,3.553v15.368H17V14.422h6.36l0.408,4.044h1.639l0.293-0.473
			c0.667-1.074,2.776-3.572,7.948-3.572c4.966,0,10.311,3.872,10.311,12.374V43.467z"
                          />
                        </g>
                      </g>
                    </svg>
                  </a>
                )}
                {socials.github && socials.github !== "" && (
                  <a
                    href={socials.github}
                    className="text-[#0f172a] hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
