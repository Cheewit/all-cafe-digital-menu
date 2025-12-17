import React, { useState, useMemo } from 'react';
import Card from './Card';
import { useAggregates } from '../hooks/useAggregates';
import { DateRange } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { UserRole } from '../types';

type Aggregates = ReturnType<typeof useAggregates>;
type Persona = 'overall' | 'executive' | 'marketing';

interface InsightCardProps {
    aggregates: Aggregates;
    dateRange?: DateRange;
    userRole: UserRole;
}

const personaConfig: { [key in Persona]: { label: string; } } = {
    overall: {
        label: 'ภาพรวม',
    },
    executive: {
        label: 'สำหรับผู้บริหาร',
    },
    marketing: {
        label: 'สำหรับทีมการตลาด',
    }
};

const generateSummaryText = (aggregates: Aggregates, dateRange: DateRange | undefined, persona: Persona): string => {
    if (aggregates.totalOrders === 0) {
        return "ไม่มีข้อมูลในช่วงเวลาที่เลือกเพื่อสร้างสรุป";
    }

    const dateRangeString = dateRange?.from
        ? (dateRange.to && !isSameDay(dateRange.from, dateRange.to)
            ? `${format(dateRange.from, 'd MMM yyyy')} - ${format(dateRange.to, 'd MMM yyyy')}`
            : format(dateRange.from, 'd MMM yyyy'))
        : "All Time";

    const totalOrders = aggregates.totalOrders.toLocaleString('th-TH');
    const totalSales = `${aggregates.sales.toLocaleString('th-TH')} บาท`;
    const avgOrderValue = `${aggregates.avgOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;

    const topProduct = aggregates.topProducts[0]
        ? `"${aggregates.topProducts[0].name}" (ยอดขาย ${aggregates.topProducts[0].sales.toLocaleString('th-TH')} บาท จาก ${aggregates.topProducts[0].count} รายการ)`
        : 'ไม่มี';
    
    const likeRate = `${aggregates.likeRate}%`;

    const topSweetnessSorted = [...aggregates.bySweetness].sort((a: { count: number }, b: { count: number }) => b.count - a.count);
    const topSweetness = topSweetnessSorted[0];
    const topSweetnessText = topSweetness
        ? `ระดับ "${topSweetness.level}" (${topSweetness.count} จาก ${totalOrders} รายการ)`
        : 'ไม่มี';

    const topProvincesList = (Object.entries(aggregates.byProvince) as [string, number][])
        .filter(([name]) => name !== 'ไม่ทราบจังหวัด' && name !== 'Unknown Province')
        .sort(([, countA], [, countB]) => countB - countA);
    const topProvinceText = topProvincesList.length > 0
        ? `"${topProvincesList[0][0]}" (${topProvincesList[0][1]} รายการ)`
        : 'ไม่ระบุ';

    const busiestDaySorted = aggregates.byDayOfWeek.sort((a, b) => b.count - a.count);
    const busiestDay = busiestDaySorted[0];
    const busiestDayText = busiestDay ? `"${busiestDay.day}" (${busiestDay.count} รายการ)` : 'ไม่มี';

    const busiestHours = aggregates.byHour
        .filter(h => h.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(h => `${h.hour}:00 น.`)
        .join(', ');
    const busiestHoursText = busiestHours || 'ไม่มี';

    const avgSessionDuration = `${aggregates.avgTotalDuration} วินาที`;
    
    // Top 3 Languages for 'overall' summary
    let top3LanguagesText = aggregates.byLanguage
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((lang, i) => `${i + 1}. ${lang.language} (${lang.count.toLocaleString('th-TH')} รายการ)`)
        .join(' / ');
    if (!top3LanguagesText) top3LanguagesText = 'ไม่มีข้อมูล';

    // Top 3 Provinces for 'overall' summary
    let top3ProvincesText = topProvincesList
        .slice(0, 3)
        .map(([name, count], i) => `${i + 1}. ${name} (${count.toLocaleString('th-TH')} รายการ)`)
        .join(' / ');
    if (!top3ProvincesText) top3ProvincesText = 'ไม่ระบุ';

    const topPromotion = aggregates.byPromotion[0];
    const topPromotionText = topPromotion
        ? `"${topPromotion.name}" (ใช้ไป ${topPromotion.count.toLocaleString('th-TH')} ครั้ง, สร้างส่วนลดรวม ${topPromotion.totalDiscount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท)`
        : 'ไม่มี';


    switch (persona) {
        case 'executive':
            return `**สรุปผลการวิเคราะห์ยอดขายและพฤติกรรมลูกค้า (${dateRangeString})**

สำหรับผู้บริหาร:

*   **ภาพรวมผลการดำเนินงาน**
    *   ยอดขายรวมทั้งหมด: ${totalSales}
    *   จำนวนออเดอร์ทั้งหมด: ${totalOrders} ออเดอร์
    *   มูลค่าเฉลี่ยต่อออเดอร์: ${avgOrderValue}

*   **ความพึงพอใจลูกค้า**
    *   อัตราความพึงพอใจ (ลูกค้ากด "ถูกใจ") อยู่ที่: ${likeRate} ซึ่งเป็นสัญญาณที่ดี

*   **พฤติกรรมลูกค้าและช่วงเวลาที่คึกคัก**
    *   วันที่คึกคักที่สุด: ${busiestDayText}
    *   ช่วงเวลาที่คึกคักที่สุด: ${busiestHoursText}
    *   สินค้าขายดีที่สุด: ${topProduct}
    *   จังหวัดที่มีการสั่งซื้อสูงสุด: ${topProvinceText}`;

        case 'marketing':
             return `**สรุปข้อมูลเชิงลึกสำหรับทีมการตลาด (${dateRangeString})**

*   **สินค้าดาวเด่น:**
    *   สินค้าที่ได้รับความนิยมสูงสุดคือ ${topProduct} เหมาะสำหรับนำไปทำโปรโมชั่นหรือไฮไลท์ในแคมเปญต่อไป
    
*   **โปรโมชันที่มีประสิทธิภาพ:**
    *   ${topPromotionText} คือโปรโมชันที่ถูกใช้บ่อยที่สุด และสร้างยอดขายได้ถึง ${topPromotion ? topPromotion.totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} บาท

*   **เจาะลึกความชอบลูกค้า:**
    *   ระดับความหวานที่ลูกค้าส่วนใหญ่เลือกคือ ${topSweetnessText} แสดงถึงเทรนด์การบริโภคที่ชัดเจน

*   **โอกาสทางภูมิศาสตร์:**
    *   จังหวัดที่มีการสั่งซื้อมากที่สุดคือ ${topProvinceText} สามารถใช้เป็นเป้าหมายในการทำโฆษณาเฉพาะพื้นที่

*   **ช่วงเวลาทอง:**
    *   วันที่มีการสั่งซื้อมากที่สุดคือ ${busiestDayText}
    *   ช่วงเวลาที่มีคนสั่งเยอะที่สุดคือ ${busiestHoursText} ควรจัดโปรโมชั่นหรือเพิ่มกำลังคนในช่วงเวลานี้

*   **ความรู้สึกของลูกค้า:**
    *   ลูกค้ามีความพึงพอใจในระดับ ${likeRate} เป็นโอกาสในการสร้าง Brand Loyalty ผ่านโปรแกรมสมาชิก`;

        case 'overall':
        default:
            return `**ภาพรวมรายงานสรุป (${dateRangeString})**

*   **ประสิทธิภาพโดยรวม:**
    *   มียอดสั่งซื้อรวม ${totalOrders} รายการ และยอดขายรวม ${totalSales}
    *   มูลค่าเฉลี่ยต่อออเดอร์อยู่ที่ ${avgOrderValue}

*   **สินค้าและโปรโมชันยอดนิยม:**
    *   สินค้าขายดีที่สุด: ${topProduct}
    *   โปรโมชันยอดนิยม: ${topPromotionText}

*   **ความพึงพอใจลูกค้า:**
    *   อัตราความพึงพอใจของลูกค้าอยู่ที่ ${likeRate}

*   **ข้อมูลเชิงลึกด้านพฤติกรรม:**
    *   ภาษาที่ใช้สั่งซื้อ 3 อันดับแรก: ${top3LanguagesText}
    *   จังหวัดยอดนิยม 3 อันดับแรก: ${top3ProvincesText}
    *   ความหวานยอดนิยม: ${topSweetnessText}
    *   วันยอดนิยม: ${busiestDayText}
    *   ช่วงเวลายอดนิยม: ${busiestHoursText}
    *   เวลาเฉลี่ยในการใช้งาน: ${avgSessionDuration}`;
    }
};

const SummaryInsightCard: React.FC<InsightCardProps> = ({ aggregates, dateRange, userRole }) => {
    const [persona, setPersona] = useState<Persona>('overall');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'denied'>('idle');

    const summaryText = useMemo(() => {
        return generateSummaryText(aggregates, dateRange, persona);
    }, [aggregates, dateRange, persona]);

    const handleCopy = () => {
        if (userRole === 'guest') {
            setCopyStatus('denied');
            setTimeout(() => setCopyStatus('idle'), 3000);
            return;
        }

        const plainText = summaryText.replace(/\*\*/g, '');
        navigator.clipboard.writeText(plainText);
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 2000);
    };

    const getCopyButtonContent = () => {
        switch (copyStatus) {
            case 'success':
                return (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>คัดลอกแล้ว</span>
                    </>
                );
            case 'denied':
                 return (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span>สำหรับผู้ได้รับอนุญาตเท่านั้น</span>
                    </>
                );
            case 'idle':
            default:
                return (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>คัดลอก</span>
                    </>
                );
        }
    };

    return (
        <Card span="3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-base font-semibold leading-6 text-slate-100 flex items-center gap-2">
                        Summary Insights
                    </h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">// สรุปข้อมูลทั้งหมดเป็นข้อความให้อ่านง่าย</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-lg">
                        {(Object.keys(personaConfig) as Persona[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPersona(p)}
                                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${persona === p ? 'bg-slate-700 text-slate-100' : 'bg-transparent text-slate-400 hover:bg-slate-700/50'}`}
                            >
                                {personaConfig[p].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="relative min-h-[12rem] bg-slate-900/70 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300">
                <button onClick={handleCopy} className={`absolute top-2 right-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors z-10 ${copyStatus === 'denied' ? 'bg-red-900/50 text-red-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
                    {getCopyButtonContent()}
                </button>

                <div className="prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 max-w-none">
                    {summaryText.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex}>
                            {line.split('**').map((part, i) => 
                                i % 2 === 1 ? <strong key={i} className="text-cyan-300 font-bold">{part}</strong> : <span>{part}</span>
                            )}
                        </p>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default SummaryInsightCard;