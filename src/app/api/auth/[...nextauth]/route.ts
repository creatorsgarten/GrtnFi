import NextAuth, { NextAuthOptions, getServerSession } from 'next-auth'
import type { OAuthConfig } from 'next-auth/providers'

/**
 * Data contained in ID token returned by Authgarten OIDC provider.
 * https://github.com/creatorsgarten/creatorsgarten.org/blob/main/src/backend/auth/mintIdToken.ts
 */
export interface AuthgartenOidcClaims {
  /** Unique user ID (24 characters hexadecimal) */
  sub: string

  /** Full name */
  name: string

  /** Avatar URL */
  picture: string

  /** Connections */
  connections: {
    github?: {
      /** GitHub user ID */
      id: number
      /** Username */
      username: string
    }
    eventpop: {
      /** Eventpop user ID */
      id: number
    }
  }
}

const creatorsgartenProvider = {
  type: 'oauth',
  id: 'creatorsgarten',
  name: 'Creatorsgarten',
  issuer: 'https://creatorsgarten.org',
  wellKnown: 'https://creatorsgarten.org/.well-known/openid-configuration',
  authorization: { params: { response_type: 'id_token' } },

  clientId: 'https://github.com/creatorsgarten/GrtnFi',

  idToken: true,
  profile: (profile) => {
    return {
      id: profile.sub,
      name: profile.name,
      image: profile.picture,
    }
  },
} satisfies OAuthConfig<AuthgartenOidcClaims>

declare module 'next-auth/jwt' {
  export interface JWT {
    username?: string
  }
}
declare module 'next-auth' {
  export interface Session {
    userId?: string
    username?: string
  }
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [creatorsgartenProvider],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = (
          profile as AuthgartenOidcClaims
        ).connections.github?.username
      }
      return token
    },
    async session({ session, token }) {
      session.userId = token.sub
      session.username = token.username
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

export function getSession() {
  return getServerSession(authOptions)
}
