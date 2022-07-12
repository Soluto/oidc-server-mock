namespace OpenIdConnectServer.Helpers
{
    public static class MergeHelper
    {
        public static void Merge<T>(T source, T target)
        {
            Type t = typeof(T);

            var properties = t.GetProperties().Where(prop => prop.CanRead && prop.CanWrite);

            foreach (var prop in properties)
            {
                var value = prop.GetValue(source, null);
                if (value != null)
                {
                    prop.SetValue(target, value, null);
                }
            }
        }
    }
}
