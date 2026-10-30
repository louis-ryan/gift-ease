import { useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';
import styled from 'styled-components';
import Logo from '../../components/Logo';
import Money from '../../components/Money';
import GiftMessageText from '../../components/GiftMessageText';
import { formatMoney, formatGoal } from '../../utils/money';
import { wishGoal, wishCurrency } from '../../utils/wishGoal';

const roundMoney = (value) => Math.round(value * 100) / 100;

// ── Layout ────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: var(--bg);
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid var(--surface);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 1px 4px rgba(91,58,33,0.06);
`;

const NavBackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: background 0.2s ease;
  &:hover { background: var(--border); }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.85; }

  ${props => props.$variant === 'edit' && `background: var(--surface); color: var(--text-primary);`}
  ${props => props.$variant === 'delete' && `background: var(--error-soft); color: var(--error);`}
`;

// ── Body ──────────────────────────────────────────────────────────────────
const Body = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 160px;
  display: flex;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 24px 16px;
  }
`;

// ── Left col ──────────────────────────────────────────────────────────────
const LeftCol = styled.div`
  width: 460px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const WishCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--surface);
`;

const WishImg = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
`;

const WishImgPlaceholder = styled.div`
  width: 100%;
  height: 240px;
  background: linear-gradient(135deg, var(--surface) 0%, var(--border) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WishCardBody = styled.div`
  padding: 20px;
`;

const WishTitle = styled.h1`
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
`;

const WishDesc = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.6;
`;

const WishGoalRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const WishGoalLabel = styled.span`
  font-size: 13px;
  color: var(--text-tertiary);
`;

const WishGoalVal = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--surface);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent) 100%);
  border-radius: 999px;
`;

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-tertiary);
`;

// ── Edit form ─────────────────────────────────────────────────────────────
const EditCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EditTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease;
  &:focus { border-color: var(--accent); }
`;

const Textarea = styled.textarea`
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s ease;
  &:focus { border-color: var(--accent); }
`;

const EditBtnRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const SaveBtn = styled.button`
  padding: 9px 18px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`;

const CancelBtn = styled.button`
  padding: 9px 18px;
  background: var(--surface);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: var(--border); }
`;

// ── Right col ─────────────────────────────────────────────────────────────
const RightCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--surface);
`;

const ChartCardTitle = styled.h2`
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
`;

const ChartWrap = styled.div`
  position: relative;
  height: 280px;
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
`;

const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const LegendName = styled.span`
  color: var(--text-primary);
`;

const LegendVal = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

// ── Contributors ──────────────────────────────────────────────────────────
const ContributorsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--surface);
`;

const ContributorsTitle = styled.h2`
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
`;

const ContributorItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--surface);

  &:last-child { border-bottom: none; }
`;

const ContributorLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContributorAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ContributorInfo = styled.div`
  min-width: 0;
`;

const ContributorMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ContributorMessage = styled.div`
  margin: 10px 0 0 48px;
  padding: 12px 14px;
  background: var(--surface-soft);
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
`;

const MessageMedia = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${(p) => (p.$spaced ? '10px' : '0')};

  a, img {
    display: block;
  }
  img {
    width: 88px;
    height: 88px;
    object-fit: cover;
    border-radius: 10px;
    background: var(--surface);
  }
  img.gif {
    width: auto;
    max-width: 200px;
    height: 120px;
  }
`;

const ContributorName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
`;

const ContributorDate = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
`;

const ContributorAmount = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
`;

const EmptyContributors = styled.p`
  color: var(--text-tertiary);
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
  margin: 0;
`;

// ── Loading / Error states ────────────────────────────────────────────────
const CenterWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

// ── Component ─────────────────────────────────────────────────────────────
const Note = ({ selectedCurrency }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [data, setData] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', amount: '', noteUrl: '' });

  const router = useRouter();
  const noteId = router.query.id;

  const deleteNote = async () => {
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      router.push('/');
    } catch (error) { console.log(error); }
  };

  const updateNote = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Older wishes have no currency; their goal was in USD, so save it as such
        body: JSON.stringify({ ...editForm, currency: wishCurrency(note) }),
      });
      const updatedNote = await res.json();
      if (!res.ok) throw new Error(updatedNote.error || 'Failed to save changes');
      setNote(updatedNote.data);
      setIsEditing(false);
      getPaymentsData(noteId, updatedNote.data);
    } catch (error) {
      console.error('Error updating note:', error);
      alert(error.message);
    }
  };

  const handleEditClick = () => {
    if (note) {
      setEditForm({ title: note.title || '', description: note.description || '', amount: String(wishGoal(note) || ''), noteUrl: note.noteUrl || '' });
      setIsEditing(true);
    }
  };

  const getPaymentsData = async (noteId, note) => {
    try {
      const res = await fetch(`/api/getStripePaymentsForGift?giftId=${noteId}`, {
        method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const resJSON = await res.json();
      // Messages, photos and GIFs come from the giftee-only route (the gift route is public)
      const privateRes = await fetch(`/api/getStripePaymentsForAccount?giftId=${noteId}`).catch(() => null);
      const privateById = {};
      if (privateRes?.ok) {
        const { payments } = await privateRes.json();
        payments.forEach((p) => { privateById[p.id] = p; });
      }
      const COLORS = ['#B4532A', '#E9C46A', '#5E7A4E', '#A9744F', '#7A9CA8', '#C98A6B'];
      const paymentSlices = resJSON.payments.map((payment, i) => ({
        id: payment.id,
        name: payment.senderName || 'Anonymous',
        // In the wish's currency, so slices add up against the goal
        value: roundMoney(payment.wishAmount),
        // What they actually sent, in the currency they sent it in
        sentAmount: payment.amount,
        sentCurrency: payment.currency,
        color: COLORS[i % COLORS.length],
        message: privateById[payment.id]?.message || '',
        photoUrls: privateById[payment.id]?.photoUrls || [],
        gifUrl: privateById[payment.id]?.gifUrl || '',
        date: payment.date,
      }));
      setContributors(paymentSlices);
      const totalGoal = wishGoal(note);
      const totalPaid = resJSON.totalPaid;
      const remaining = roundMoney(Math.max(0, totalGoal - totalPaid));
      setData([
        ...paymentSlices,
        { name: 'Remaining', value: remaining, color: '#EFE4D3' },
      ]);
    } catch (error) { console.error('Error fetching payments:', error); }
  };

  const getInitialProps = async (noteId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes/${noteId}`);
      const response = await res.json();
      if (response.success && response.data) {
        setNote(response.data);
        getPaymentsData(noteId, response.data);
      } else {
        setNote(null);
      }
    } catch (error) {
      setNote(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!noteId) return;
    getInitialProps(noteId);
  }, [noteId]);

  if (loading) {
    return <CenterWrap><Spinner /></CenterWrap>;
  }

  if (!note) {
    return (
      <CenterWrap>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Note not found.</p>
          <Link href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to Dashboard</Link>
        </div>
      </CenterWrap>
    );
  }

  const totalPaid = roundMoney(data.filter(d => d.name !== 'Remaining').reduce((s, d) => s + d.value, 0));
  const totalGoal = wishGoal(note);
  const progress = totalGoal > 0 ? Math.min(100, Math.round((totalPaid / totalGoal) * 100)) : 0;
  const cur = wishCurrency(note);

  return (
    <Page>
      <TopBar>
        <Logo />

        <NavBackBtn href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </NavBackBtn>

        <NavActions>
          <NavBtn $variant="edit" onClick={handleEditClick}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Edit
          </NavBtn>
          <NavBtn $variant="delete" onClick={deleteNote}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Delete
          </NavBtn>
        </NavActions>
      </TopBar>

      <Body>
        {/* Left */}
        <LeftCol>
          <WishCard>
            {note.noteUrl ? (
              <WishImg src={note.noteUrl} alt={note.title} />
            ) : (
              <WishImgPlaceholder>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#D9C7AC" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#D9C7AC"/>
                  <path d="M21 15l-5-5-4 4" stroke="#D9C7AC" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </WishImgPlaceholder>
            )}
            <WishCardBody>
              <WishTitle>{note.title}</WishTitle>
              <WishDesc>{note.description}</WishDesc>
              <WishGoalRow>
                <WishGoalLabel>Goal</WishGoalLabel>
                <WishGoalVal><Money amount={totalGoal} currency={cur} defaultCurrency={selectedCurrency} format={formatGoal} /></WishGoalVal>
              </WishGoalRow>
              <ProgressBar>
                <ProgressFill style={{ width: `${progress}%` }} />
              </ProgressBar>
              <ProgressMeta>
                <span>{formatMoney(totalPaid, cur)} raised · {contributors.length} contributor{contributors.length === 1 ? '' : 's'}</span>
                <span>{progress}% funded</span>
              </ProgressMeta>
            </WishCardBody>
          </WishCard>

          {isEditing && (
            <EditCard>
              <EditTitle>Edit Gift Details</EditTitle>
              <FormGroup>
                <Label>Title</Label>
                <Input type="text" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </FormGroup>
              <FormGroup>
                <Label>Goal ({cur})</Label>
                <Input type="number" step="0.01" min="0" value={editForm.amount} onChange={(e) => setEditForm(p => ({ ...p, amount: e.target.value }))} />
              </FormGroup>
              <FormGroup>
                <Label>Image URL</Label>
                <Input type="url" value={editForm.noteUrl} onChange={(e) => setEditForm(p => ({ ...p, noteUrl: e.target.value }))} placeholder="https://example.com/image.jpg" />
              </FormGroup>
              <EditBtnRow>
                <CancelBtn onClick={() => setIsEditing(false)}>Cancel</CancelBtn>
                <SaveBtn onClick={updateNote}>Save Changes</SaveBtn>
              </EditBtnRow>
            </EditCard>
          )}
        </LeftCol>

        {/* Right */}
        <RightCol>
          <ChartCard>
            <ChartCardTitle>Contribution Progress</ChartCardTitle>
            {data.length > 0 ? (
              <>
                <ChartWrap>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="52%"
                        outerRadius="72%"
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        paddingAngle={2}
                      >
                        {data.map((entry, index) => (
                          <Cell key={entry.id || entry.name} fill={entry.color} opacity={activeIndex === index ? 0.8 : 1} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [formatMoney(value, cur), name]}
                        contentStyle={{ borderRadius: 10, border: '1px solid var(--surface)', fontSize: 13 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{progress}%</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>funded</div>
                  </div>
                </ChartWrap>

                <LegendList>
                  {data.filter(d => d.name !== 'Remaining').map((item, i) => (
                    <LegendItem key={item.id || i}>
                      <LegendLeft>
                        <LegendDot $color={item.color} />
                        <LegendName>{item.name}</LegendName>
                      </LegendLeft>
                      <LegendVal>+{formatMoney(item.value, cur)}</LegendVal>
                    </LegendItem>
                  ))}
                  <LegendItem>
                    <LegendLeft>
                      <LegendDot $color="var(--border)" />
                      <LegendName style={{ color: 'var(--text-tertiary)' }}>Remaining</LegendName>
                    </LegendLeft>
                    <LegendVal style={{ color: 'var(--text-tertiary)' }}>{formatMoney(roundMoney(Math.max(0, totalGoal - totalPaid)), cur)}</LegendVal>
                  </LegendItem>
                </LegendList>
              </>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px 0', margin: 0 }}>No contributions yet</p>
            )}
          </ChartCard>

          <ContributorsCard>
            <ContributorsTitle>Contributors</ContributorsTitle>
            {contributors.length > 0 ? contributors.map((item, i) => (
              <ContributorItem key={item.id || i}>
                <ContributorMain>
                  <ContributorLeft>
                    <ContributorAvatar>{item.name ? item.name.charAt(0).toUpperCase() : '?'}</ContributorAvatar>
                    <ContributorInfo>
                      <ContributorName>{item.name}</ContributorName>
                      <ContributorDate>{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</ContributorDate>
                    </ContributorInfo>
                  </ContributorLeft>
                  <ContributorAmount>
                    <Money prefix="+" amount={item.sentAmount} currency={item.sentCurrency} defaultCurrency={selectedCurrency} />
                  </ContributorAmount>
                </ContributorMain>
                {(item.message || item.photoUrls.length > 0 || item.gifUrl) && (
                  <ContributorMessage>
                    <GiftMessageText text={item.message} />
                    {(item.photoUrls.length > 0 || item.gifUrl) && (
                      <MessageMedia $spaced={Boolean(item.message)}>
                        {item.photoUrls.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Photo from ${item.name}`} loading="lazy" />
                          </a>
                        ))}
                        {item.gifUrl && <img className="gif" src={item.gifUrl} alt={`GIF from ${item.name}`} loading="lazy" />}
                      </MessageMedia>
                    )}
                  </ContributorMessage>
                )}
              </ContributorItem>
            )) : (
              <EmptyContributors>No contributors yet — share your wishlist to get started!</EmptyContributors>
            )}
          </ContributorsCard>
        </RightCol>
      </Body>
    </Page>
  );
};

export default Note;
