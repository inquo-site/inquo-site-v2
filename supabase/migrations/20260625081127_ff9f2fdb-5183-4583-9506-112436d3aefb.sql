DELETE FROM public.tools WHERE tool_type = 'linkedin-post';
INSERT INTO public.tools (name, description, category, icon, is_premium, credits_cost, route_path, tool_type, badge, display_order, is_free_tool)
VALUES (
  'LinkedIn Post Optimizer',
  'Turn any rough idea into a scroll-stopping LinkedIn post with hook, story, CTA & hashtags.',
  'Career',
  'MessageSquare',
  false,
  5,
  '/tool/linkedin-post',
  'linkedin-post',
  'NEW',
  3,
  true
);