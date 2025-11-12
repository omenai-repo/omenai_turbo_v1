import { auth_uri } from "@omenai/url-config/src/config";
import { Link, Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const AcceptArtistMail = (artist_name: string) => {
  const url = auth_uri();
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We are excited to inform you that your Artist account has been
        successfully verified on <strong>Omenai</strong> You can now fully
        access all the features of our platform and start showcasing your
        artwork to our community of art enthusiasts.
      </Text>

      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        What next?
      </Text>

      <ul>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            <Link href={`${url}/login`}>Login</Link> to your artist account.
          </Text>
        </li>

        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Upload your latest artworks and manage your gallery.
          </Text>
        </li>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Connect with potential buyers and art lovers.
          </Text>
        </li>
      </ul>
    </ArtistEmailLayout>
  );
};

export default AcceptArtistMail;
