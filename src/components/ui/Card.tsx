"use client";

import { ReactNode, useState, ComponentType, SVGProps, Children, isValidElement } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

function cardClasses(accent: boolean, feature: boolean, hover: boolean, extra = "") {
  return [
    "card-white card-motion h-full overflow-hidden",
    accent ? "card-accent-light" : "",
    feature ? "card-feature card-shine" : "",
    hover ? "" : "card-no-hover",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Decorative layers — dot grid + ambient arc. */
export function CardDecor({ dark = false }: { dark?: boolean }) {
  if (dark) return null;
  return (
    <>
      <span aria-hidden className="card-deco-dots" />
      <span aria-hidden className="card-deco-arc" />
    </>
  );
}

type CardShellProps = {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  feature?: boolean;
  hover?: boolean;
};

/** Inner shell — lift on hover/tap (transform only; shadow via CSS). */
function CardShell({ children, className = "", accent = false, feature = false, hover = true }: CardShellProps) {
  const { hoverProps } = useCardMotion();
  return (
    <motion.div className={cardClasses(accent, feature, hover, `group ${className}`)} {...hoverProps(hover)}>
      {accent ? <span aria-hidden className="card-accent-bar" /> : null}
      <CardDecor />
      {feature ? <span aria-hidden className="card-shine-sweep" /> : null}
      <div className="relative z-[2]">{children}</div>
    </motion.div>
  );
}

type CardProps = CardShellProps & {
  delay?: number;
  as?: "div" | "article" | "section";
  skipEntrance?: boolean;
};

/** Animated base card — scroll entrance + optional hover lift. */
export function Card({ children, delay = 0, as = "div", skipEntrance = false, ...shell }: CardProps) {
  const { entrance } = useCardMotion();
  const tags = { div: motion.div, article: motion.article, section: motion.section };
  const Tag = tags[as];

  if (skipEntrance) {
    return (
      <div className="h-full">
        <CardShell {...shell}>{children}</CardShell>
      </div>
    );
  }

  return (
    <Tag className="h-full" {...entrance(delay)}>
      <CardShell {...shell}>{children}</CardShell>
    </Tag>
  );
}

export function CardIconWell({
  children,
  className = "",
  filled = false,
}: {
  children: ReactNode;
  className?: string;
  filled?: boolean;
}) {
  const { iconMicro } = useCardMotion();
  return (
    <motion.div className={`card-icon-well ${className}`} {...iconMicro(filled)}>
      {children}
    </motion.div>
  );
}

/** Lucide icon chip — teal gem that inverts on hover. */
export function ServiceCardIcon({
  icon: Icon,
  filled = false,
  dark = false,
  className = "",
  emoji,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  filled?: boolean;
  dark?: boolean;
  className?: string;
  emoji?: ReactNode;
}) {
  const { iconMicro } = useCardMotion();
  const chipClass = [
    "svc-icon-chip",
    filled ? "svc-icon-chip--filled" : "",
    dark ? "svc-icon-chip--dark" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.span className={chipClass} {...iconMicro(filled || dark)}>
      {Icon ? (
        <Icon
          className={`w-5 h-5 relative z-[1] ${
            filled || dark
              ? "text-white"
              : "text-[#0077A8] transition-colors duration-300 group-hover:text-white"
          }`}
          strokeWidth={1.8}
        />
      ) : (
        <span className="text-xl leading-none relative z-[1]">{emoji}</span>
      )}
    </motion.span>
  );
}

/** Circular arrow CTA — fills teal on card hover. */
export function ServiceCardArrow({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <span
      className={`card-arrow-circle ${dark ? "card-arrow-circle--dark" : ""} ${className}`}
      aria-hidden
    >
      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
    </span>
  );
}

/** Sliding left accent bar — shared layoutId animates between active/hovered cards. */
export function ServiceCardAccentBar({ layoutId = "activeCardBorder" }: { layoutId?: string }) {
  return (
    <motion.div
      layoutId={layoutId}
      className="pointer-events-none absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-[#0077A8] via-[#00B4D8] to-[#7DD3EA] z-[3]"
      transition={{ duration: 0 }}
    />
  );
}

type FeatureCardProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
  delay?: number;
  skipEntrance?: boolean;
  index?: number;
};

export function FeatureCard({
  icon,
  title,
  description,
  className = "",
  children,
  delay = 0,
  skipEntrance = false,
  index,
}: FeatureCardProps) {
  return (
    <Card accent feature delay={delay} skipEntrance={skipEntrance} className={`p-6 lg:p-8 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-5">
        {icon ? <CardIconWell className="flex-shrink-0">{icon}</CardIconWell> : null}
        {index != null ? (
          <span className="card-number-badge" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : (
          <ServiceCardArrow />
        )}
      </div>
      <h3 className="text-base font-extrabold text-[#00283C] mb-2.5 leading-snug tracking-tight transition-transform duration-200 ease-out group-hover:translate-x-0.5">
        {title}
      </h3>
      <p className="text-sm text-[#00283C]/55 leading-relaxed">{description}</p>
      <hr className="card-footer-rule mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {children}
    </Card>
  );
}

type FeatureCardGridProps = {
  items: { icon?: ReactNode; title: string; description?: string; desc?: string }[];
  className?: string;
};

export function FeatureCardGrid({
  items,
  className = "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
}: FeatureCardGridProps) {
  return (
    <StaggerGrid className={className}>
      {items.map((item, i) => (
        <FeatureCard
          key={item.title}
          index={i}
          icon={item.icon}
          title={item.title}
          description={item.description || item.desc || ""}
          skipEntrance
          className="h-full"
        />
      ))}
    </StaggerGrid>
  );
}

/** Staggered entrance wrapper for card grids. */
export function StaggerGrid({
  children,
  className = "",
  animateOnMount = false,
}: {
  children: ReactNode;
  className?: string;
  animateOnMount?: boolean;
}) {
  const { containerVariants, itemVariants, viewport } = useCardMotion();
  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      {...(animateOnMount
        ? { animate: "visible" }
        : { whileInView: "visible", viewport })}
    >
      {items.map((child, i) => (
        <motion.div
          key={isValidElement(child) && child.key != null ? child.key : i}
          variants={itemVariants}
          className="h-full"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CardStatPill({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { iconMicro } = useCardMotion();
  return (
    <motion.span className={`card-stat-pill ${className}`} {...iconMicro()}>
      {children}
    </motion.span>
  );
}

/** Animated link card for service / pricing grids. */
export function AnimatedLinkCard({
  href,
  children,
  className = "",
  delay = 0,
  dark = false,
  shine = false,
  skipEntrance = false,
  showAccentBar = false,
  accentLayoutId = "activeCardBorder",
  onPointerEnter,
  onPointerLeave,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
  shine?: boolean;
  skipEntrance?: boolean;
  showAccentBar?: boolean;
  accentLayoutId?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const { entrance, hoverProps } = useCardMotion();
  const motionProps = skipEntrance ? hoverProps(true) : { ...entrance(delay), ...hoverProps(true) };

  return (
    <motion.a
      href={href}
      {...motionProps}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`group relative flex flex-col no-underline rounded-[1.25rem] overflow-hidden card-motion card-shadow-hover ${className} ${
        dark
          ? "card-shadow-hover-dark text-white"
          : "card-white"
      } ${shine && !dark ? "card-feature card-shine" : ""}`}
    >
      {!dark ? <CardDecor /> : null}
      {shine && !dark ? <span aria-hidden className="card-shine-sweep" /> : null}
      {showAccentBar && !dark ? <ServiceCardAccentBar layoutId={accentLayoutId} /> : null}
      <div className="relative z-[2] flex flex-col flex-1">{children}</div>
    </motion.a>
  );
}

/** Compact service card — vertical bento layout. */
export function ServiceCard({
  href,
  icon,
  title,
  description,
  active = false,
  className = "p-6",
  showAccentBar = false,
  accentLayoutId = "activeCardBorder",
  onPointerEnter,
  onPointerLeave,
  skipEntrance = false,
}: {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  active?: boolean;
  className?: string;
  showAccentBar?: boolean;
  accentLayoutId?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  skipEntrance?: boolean;
}) {
  return (
    <AnimatedLinkCard
      href={href}
      shine={false}
      className={`gap-4 ${className}`}
      showAccentBar={showAccentBar || active}
      accentLayoutId={accentLayoutId}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      skipEntrance={skipEntrance}
    >
      <div className="flex items-start justify-between gap-3">
        <ServiceCardIcon icon={icon} filled={active} />
        <ServiceCardArrow />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-extrabold text-[#00283C] leading-snug tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-[#00283C]/55 leading-relaxed">{description}</p>
      </div>
      <hr className="card-footer-rule mt-1" />
    </AnimatedLinkCard>
  );
}

/** Rich service card — subtitle, stat footer (homepage Solutions grid). */
export function ServiceShowcaseCard({
  href,
  icon: Icon,
  title,
  subtitle,
  description,
  stat,
  popular = false,
  showAccentBar = false,
  accentLayoutId = "activeCardBorder",
  onPointerEnter,
  onPointerLeave,
  skipEntrance = true,
  className = "p-6 lg:p-7 gap-4",
}: {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  description: string;
  stat: string;
  popular?: boolean;
  showAccentBar?: boolean;
  accentLayoutId?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  skipEntrance?: boolean;
  className?: string;
}) {
  return (
    <AnimatedLinkCard
      href={href}
      dark={popular}
      skipEntrance={skipEntrance}
      showAccentBar={showAccentBar && !popular}
      accentLayoutId={accentLayoutId}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={className}
    >
      {popular && (
        <span className="absolute top-4 right-4 z-[3] text-[9px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white tracking-wider shadow-lg">
          MOST POPULAR
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <ServiceCardIcon icon={Icon} dark={popular} />
        {!popular && <ServiceCardArrow />}
      </div>

      <div className="flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5 ${popular ? "text-[#7DD3EA]/80" : "text-[#00B4D8]"}`}>
          {subtitle}
        </p>
        <h3 className={`text-base font-extrabold mb-2 leading-snug tracking-tight ${popular ? "text-white" : "text-[#00283C]"}`}>
          {title}
        </h3>
        <p className={`text-xs leading-relaxed ${popular ? "text-white/65" : "text-[#00283C]/55"}`}>
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <CardStatPill className={popular ? "bg-white/10 border-white/20 text-white/80" : ""}>{stat}</CardStatPill>
        {popular ? <ServiceCardArrow dark /> : null}
      </div>
      <hr className={`card-footer-rule mt-2 ${popular ? "card-footer-rule--dark" : ""}`} />
    </AnimatedLinkCard>
  );
}

/** Grid of ServiceCards with shared sliding accent bar on hover. */
export function ServiceCardGrid({
  items,
  className = "grid grid-cols-1 sm:grid-cols-2 gap-4",
  accentLayoutId = "activeCardBorder",
}: {
  items: {
    href: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    active?: boolean;
  }[];
  className?: string;
  accentLayoutId?: string;
}) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <StaggerGrid className={className}>
      {items.map((item) => {
        const showBar = item.active || hoveredHref === item.href;
        return (
          <ServiceCard
            key={item.href}
            {...item}
            skipEntrance
            showAccentBar={showBar}
            accentLayoutId={accentLayoutId}
            onPointerEnter={() => setHoveredHref(item.href)}
            onPointerLeave={() => setHoveredHref((prev) => (prev === item.href ? null : prev))}
          />
        );
      })}
    </StaggerGrid>
  );
}

/** Category filter tabs with sliding active pill. */
export function ActiveTabBar<T extends string>({
  tabs,
  active,
  onChange,
  layoutId = "activeTabPill",
  className = "flex gap-2 overflow-x-auto py-3.5 scrollbar-hide",
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Filter tabs" className={className}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selected ? "text-white" : "text-[#00283C]/55 hover:text-[#00283C] hover:bg-white"
            }`}
          >
            {selected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[#00283C]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Stacked Q&A or info cards with staggered entrance. */
export function ContentCardList({
  items,
  className = "space-y-4",
  cardClassName = "p-6 lg:p-7",
}: {
  items: { q?: string; a?: string; title?: string; description?: string }[];
  className?: string;
  cardClassName?: string;
}) {
  return (
    <StaggerGrid className={className}>
      {items.map((item) => {
        const title = item.q ?? item.title ?? "";
        const body = item.a ?? item.description ?? "";
        return (
          <AnimatedSurface key={title} skipEntrance accent className={cardClassName}>
            <h3 className="font-bold text-[#00283C] mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </AnimatedSurface>
        );
      })}
    </StaggerGrid>
  );
}

/** Generic animated surface for one-off card-white blocks (contact, info panels, etc.). */
export function AnimatedSurface({
  children,
  className = "",
  delay = 0,
  hover = true,
  accent = false,
  feature = false,
  as = "div",
  skipEntrance = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  accent?: boolean;
  feature?: boolean;
  as?: "div" | "article" | "section";
  skipEntrance?: boolean;
}) {
  return (
    <Card
      as={as}
      delay={delay}
      hover={hover}
      accent={accent}
      feature={feature}
      skipEntrance={skipEntrance}
      className={className}
    >
      {children}
    </Card>
  );
}

export { staggerDelay };
