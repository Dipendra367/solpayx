use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("72citsVT8pcy5orD5HVAS9UN1aBspCkui1NmcGAB8Xsg");

#[program]
pub mod remittance {
    use super::*;

    pub fn send_remittance(
        ctx: Context<SendRemittance>,
        amount: u64,
        memo: String,
    ) -> Result<()> {
        // Validate amount
        require!(amount > 0, RemittanceError::InvalidAmount);
        require!(memo.len() <= 100, RemittanceError::MemoTooLong);

        // Calculate fee (0.1%)
        let fee_amount = amount
            .checked_mul(1)
            .unwrap()
            .checked_div(1000)
            .unwrap();

        let send_amount = amount
            .checked_sub(fee_amount)
            .unwrap();

        // Transfer to recipient
        let transfer_to_recipient = Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_to_recipient,
            ),
            send_amount,
        )?;

        // Transfer fee to treasury
        let transfer_fee = Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_fee,
            ),
            fee_amount,
        )?;

        // Emit event for tracking
        emit!(RemittanceEvent {
            sender: ctx.accounts.sender.key(),
            recipient: ctx.accounts.recipient_token_account.key(),
            amount: send_amount,
            fee: fee_amount,
            memo,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendRemittance<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[event]
pub struct RemittanceEvent {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub memo: String,
    pub timestamp: i64,
}

#[error_code]
pub enum RemittanceError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Memo must be 100 characters or less")]
    MemoTooLong,
}