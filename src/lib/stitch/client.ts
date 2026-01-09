/**
 * Stitch API Client for South African Bank Integration
 * Supports: FNB, Standard Bank, ABSA, Nedbank, Capitec
 */

const STITCH_API_URL = process.env.STITCH_API_URL || 'https://api.stitch.money/graphql'
const STITCH_AUTH_URL = process.env.STITCH_AUTH_URL || 'https://secure.stitch.money/connect/token'

export interface StitchConfig {
    clientId: string
    clientSecret: string
    redirectUri: string
}

export interface BankAccount {
    id: string
    name: string
    accountNumber: string
    bankId: string
    balance: {
        amount: number
        currency: string
    }
    accountType: string
}

export interface Transaction {
    id: string
    date: string
    amount: number
    description: string
    merchant?: string
    category?: string
    reference?: string
}

export class StitchClient {
    private config: StitchConfig

    constructor(config: StitchConfig) {
        this.config = config
    }

    /**
     * Generate authorization URL for OAuth flow
     */
    getAuthorizationUrl(state: string, scope: string[] = ['accounts', 'transactions']): string {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: scope.join(' '),
            state: state
        })

        return `https://secure.stitch.money/connect/authorize?${params.toString()}`
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code: string): Promise<{
        access_token: string
        refresh_token: string
        expires_in: number
        token_type: string
    }> {
        const response = await fetch(STITCH_AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                code: code,
                redirect_uri: this.config.redirectUri
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Token exchange failed: ${error}`)
        }

        return response.json()
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken: string): Promise<{
        access_token: string
        refresh_token: string
        expires_in: number
        token_type: string
    }> {
        const response = await fetch(STITCH_AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                refresh_token: refreshToken
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Token refresh failed: ${error}`)
        }

        return response.json()
    }

    /**
     * Make GraphQL request to Stitch API
     */
    private async graphqlRequest<T>(
        query: string,
        variables: Record<string, any>,
        accessToken: string
    ): Promise<T> {
        const response = await fetch(STITCH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ query, variables })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`GraphQL request failed: ${error}`)
        }

        const result = await response.json()

        if (result.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
        }

        return result.data
    }

    /**
     * Fetch user's bank accounts
     */
    async getBankAccounts(accessToken: string): Promise<BankAccount[]> {
        const query = `
      query GetBankAccounts {
        user {
          bankAccounts {
            id
            name
            accountNumber
            bankId
            accountType
            balance {
              amount
              currency
            }
          }
        }
      }
    `

        const data = await this.graphqlRequest<{ user: { bankAccounts: BankAccount[] } }>(
            query,
            {},
            accessToken
        )

        return data.user.bankAccounts
    }

    /**
     * Fetch transactions for a specific account
     */
    async getTransactions(
        accessToken: string,
        accountId: string,
        fromDate?: string,
        toDate?: string
    ): Promise<Transaction[]> {
        const query = `
      query GetTransactions($accountId: ID!, $from: Date, $to: Date) {
        node(id: $accountId) {
          ... on BankAccount {
            transactions(from: $from, to: $to) {
              edges {
                node {
                  id
                  date
                  amount
                  description
                  merchant
                  category
                  reference
                }
              }
            }
          }
        }
      }
    `

        const variables: Record<string, any> = { accountId }
        if (fromDate) variables.from = fromDate
        if (toDate) variables.to = toDate

        const data = await this.graphqlRequest<{
            node: {
                transactions: {
                    edges: Array<{ node: Transaction }>
                }
            }
        }>(query, variables, accessToken)

        return data.node.transactions.edges.map(edge => edge.node)
    }

    /**
     * Get supported banks
     */
    getSupportedBanks() {
        return [
            { id: 'fnb', name: 'FNB (First National Bank)', color: 'bg-orange-600' },
            { id: 'standard-bank', name: 'Standard Bank', color: 'bg-blue-700' },
            { id: 'absa', name: 'ABSA', color: 'bg-red-600' },
            { id: 'nedbank', name: 'Nedbank', color: 'bg-green-700' },
            { id: 'capitec', name: 'Capitec Bank', color: 'bg-blue-500' }
        ]
    }
}

/**
 * Get Stitch client instance
 */
export function getStitchClient(): StitchClient {
    const config: StitchConfig = {
        clientId: process.env.STITCH_CLIENT_ID || '',
        clientSecret: process.env.STITCH_CLIENT_SECRET || '',
        redirectUri: process.env.STITCH_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/banking/connect/callback`
    }

    if (!config.clientId || !config.clientSecret) {
        console.warn('Stitch API credentials not configured. Using demo mode.')
    }

    return new StitchClient(config)
}
