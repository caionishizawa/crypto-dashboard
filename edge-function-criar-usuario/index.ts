// Edge Function para criar usuários no Supabase Auth
// Deploy: supabase functions deploy criar-usuario

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse the request body
    const { email, password, nome, tipo = 'user' } = await req.json()

    if (!email || !password || !nome) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email, senha e nome são obrigatórios' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        tipo
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao criar usuário no Auth: ${authError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao criar usuário - nenhum dado retornado' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create user in usuarios table
    const { error: insertError } = await supabaseClient
      .from('usuarios')
      .insert([
        {
          id: authData.user.id,
          nome,
          email,
          tipo,
          dataRegistro: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])

    if (insertError) {
      console.error('Erro ao criar usuário na tabela:', insertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao criar usuário na tabela: ${insertError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário criado com sucesso!',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nome,
          tipo
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
