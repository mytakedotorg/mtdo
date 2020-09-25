import { FoundationHarness } from "../../common/foundationTest";
import { imageVideoCut } from "../../common/social/SocialImage";
import { HomeSocials, SOCIAL_CLINTON, SOCIAL_TRUMP } from "./infoHeader";

const foundation = FoundationHarness.loadAllFromDisk();

export const useSocialsMock = (): HomeSocials => ({
  leftSocial: imageVideoCut(
    SOCIAL_CLINTON,
    foundation.getVideo(SOCIAL_CLINTON.fact),
    "home"
  ),
  rightSocial: imageVideoCut(
    SOCIAL_TRUMP,
    foundation.getVideo(SOCIAL_TRUMP.fact),
    "home"
  ),
});
