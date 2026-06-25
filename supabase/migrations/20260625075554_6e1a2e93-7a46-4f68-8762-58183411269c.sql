
INSERT INTO public.tools (name, description, category, icon, is_premium, credits_cost, route_path, tool_type, badge, display_order, is_free_tool)
VALUES ('LinkedIn Optimizer', 'Build a magnetic LinkedIn profile — headline, about, skills, experience — in seconds.', 'Career', 'Linkedin', false, 2, '/tool/linkedin', 'linkedin', 'NEW', 5, true)
ON CONFLICT DO NOTHING;
